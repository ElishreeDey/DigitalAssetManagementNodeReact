/*
 ****************************************************************************************************************************
 * Filename    : videoService
 * Description : Video processing utilities using FFmpeg and FFprobe.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-17
 ****************************************************************************************************************************
 */

// FFmpeg is 'Fast Forward Moving Picture Experts Group"
//It is a free, open-source command-line framework used to decode, encode, transcode, stream, filter, and play multimedia files.
import ffmpeg from 'fluent-ffmpeg'
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'

// FFprobe used for to store Video height,width,duration of video exactly as Video meta data.
import ffprobeInstaller from '@ffprobe-installer/ffprobe'

import { randomUUID } from 'crypto'
import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import { MESSAGES } from '../constants'

ffmpeg.setFfmpegPath(ffmpegInstaller.path)
ffmpeg.setFfprobePath(ffprobeInstaller.path)

export type VideoMetadata = {
  width: number | undefined
  height: number | undefined
  durationSeconds: number | undefined
}

// Video file arrive at buffer first now keep it in system Temp folder before processing. then delete from temp also.
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

// Cleanup of temporary files. fs.unlink means clear file from system temp folder
export async function cleanupFiles(paths: string[]): Promise<void> {
  await Promise.all(paths.map((p) => fs.unlink(p).catch(() => null)))
}

// Video meta data here both ffmpeg and ffprobe used behide the sceen
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

//video conversion it usually change height 1080 to 720. video width FFmpeg calculate automatically and decrease.
//Here scale 2 means decrease to even width e.g like 1280 from original width 1920
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

// generate a thumbnail for video file.
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
