/*
 ****************************************************************************************************************************
 * Filename    : videoService
 * Description : Video processing utilities using FFmpeg and FFprobe.
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

// Use bundled FFmpeg binaries to avoid requiring a system-wide installation.
ffmpeg.setFfmpegPath(ffmpegInstaller.path)
ffmpeg.setFfprobePath(ffprobeInstaller.path)

export type VideoMetadata = {
  width: number | undefined
  height: number | undefined
  durationSeconds: number | undefined
}

export async function writeBufferToTempFile(
  buffer: Buffer,
  extension: string
): Promise<string> {
  const filePath = path.join(os.tmpdir(), `dam-${randomUUID()}${extension}`)
  await fs.writeFile(filePath, buffer)
  return filePath
}

export function tempOutputPath(extension: string): string {
  return path.join(os.tmpdir(), `dam-${randomUUID()}${extension}`)
}

// Best-effort cleanup of temporary files.
export async function cleanupFiles(paths: string[]): Promise<void> {
  await Promise.all(paths.map((p) => fs.unlink(p).catch(() => null)))
}

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

// "-2" preserves aspect ratio while ensuring an even width for H.264 encoding.
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
