/*
 ****************************************************************************************************************************
 * Filename    : videoService
 * Description : FFmpeg/FFprobe operations for video processing — metadata extraction, multi-resolution
 *               transcoding, and thumbnail frame capture. All functions operate on local file paths because
 *               FFmpeg's probing and encoding pipeline needs random access to the source file; the worker is
 *               responsible for downloading the MinIO object to a temp file before calling these, and for
 *               cleaning up temp files afterward via cleanupFiles().
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-17
 ****************************************************************************************************************************
 */

import ffmpeg from 'fluent-ffmpeg'
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'
import ffprobeInstaller from '@ffprobe-installer/ffprobe'
import { randomUUID } from 'crypto'
import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import { MESSAGES } from '../constants'

// Point fluent-ffmpeg at the bundled binaries so this works without a system-wide ffmpeg install
ffmpeg.setFfmpegPath(ffmpegInstaller.path)
ffmpeg.setFfprobePath(ffprobeInstaller.path)

export type VideoMetadata = {
  width: number | undefined
  height: number | undefined
  durationSeconds: number | undefined
}

// ─── Temp file helpers ─────────────────────────────────────────────────────────

// Writes a buffer to a uniquely named file in the OS temp directory and returns its path.
// FFmpeg needs a real file path for input — it cannot probe an in-memory buffer directly.
export async function writeBufferToTempFile(
  buffer: Buffer,
  extension: string
): Promise<string> {
  const filePath = path.join(os.tmpdir(), `dam-${randomUUID()}${extension}`)
  await fs.writeFile(filePath, buffer)
  return filePath
}

// Generates a temp output path without creating the file — FFmpeg writes to it directly.
export function tempOutputPath(extension: string): string {
  return path.join(os.tmpdir(), `dam-${randomUUID()}${extension}`)
}

// Deletes every path given, ignoring errors — called in a `finally` block so a failed
// job never leaves orphaned temp files behind.
export async function cleanupFiles(paths: string[]): Promise<void> {
  await Promise.all(paths.map((p) => fs.unlink(p).catch(() => null)))
}

// ─── Metadata ──────────────────────────────────────────────────────────────────

// Reads width, height, and duration from the video's first video stream.
export function getVideoMetadata(filePath: string): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err: Error | null, data: ffmpeg.FfprobeData) => {
      if (err) {
        reject(
          new Error(`${MESSAGES.VIDEO_PROBE_FAILED_MSG}: ${err.message}`, {
            cause: err,
          })
        )
        return
      }
      const videoStream = data.streams.find((s) => s.codec_type === 'video')
      resolve({
        width: videoStream?.width,
        height: videoStream?.height,
        durationSeconds: data.format.duration,
      })
    })
  })
}

// ─── Transcoding ───────────────────────────────────────────────────────────────

// Transcodes the source video to a target height, preserving aspect ratio (width: -2
// keeps it an even number, required by the H.264 encoder). Skips upscaling — callers
// should check sourceHeight >= targetHeight before calling this.
export function transcodeVideo(
  inputPath: string,
  outputPath: string,
  targetHeight: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .videoFilters(`scale=-2:${targetHeight}`)
      .outputOptions([
        '-c:v',
        'libx264',
        '-preset',
        'fast',
        '-crf',
        '23',
        '-c:a',
        'aac',
      ])
      .on('end', () => resolve())
      .on('error', (err) =>
        reject(
          new Error(`${MESSAGES.VIDEO_TRANSCODE_FAILED_MSG}: ${err.message}`, {
            cause: err,
          })
        )
      )
      .save(outputPath)
  })
}

// ─── Thumbnail ─────────────────────────────────────────────────────────────────

// Captures a single frame at VIDEO_THUMBNAIL_TIMESTAMP_SEC and saves it as a JPEG —
// used as the gallery thumbnail for video assets, same as Sharp's image thumbnail.
export function generateVideoThumbnail(
  inputPath: string,
  outputFolder: string,
  outputFilename: string,
  timestampSec: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .on('end', () => resolve(path.join(outputFolder, outputFilename)))
      .on('error', (err) =>
        reject(
          new Error(`${MESSAGES.VIDEO_THUMBNAIL_FAILED_MSG}: ${err.message}`, {
            cause: err,
          })
        )
      )
      .screenshots({
        count: 1,
        timestamps: [timestampSec],
        filename: outputFilename,
        folder: outputFolder,
      })
  })
}
