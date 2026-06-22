/*
 ****************************************************************************************************************************
 * Filename    : assetWorker
 * Description : RabbitMQ worker for asset processing.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-17
 ****************************************************************************************************************************
 */

import fs from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import { getRabbitChannel, ASSET_QUEUE } from '../config'
import { assetRepository } from '../repositories'
import {
  streamFromMinio,
  uploadThumbnailToMinio,
  uploadRenditionToMinio,
  writeBufferToTempFile,
  tempOutputPath,
  cleanupFiles,
  getVideoMetadata,
  transcodeVideo,
  generateVideoThumbnail,
} from '../services'
import {
  MESSAGES,
  THUMBNAIL_WIDTH,
  THUMBNAIL_HEIGHT,
  THUMBNAIL_QUALITY,
  VIDEO_RESOLUTIONS,
  VIDEO_THUMBNAIL_TIMESTAMP_SEC,
} from '../constants'
import type { AssetJobData, VideoRendition } from '../types'
import type { Channel, ConsumeMessage } from 'amqplib'

function streamToBuffer(readable: NodeJS.ReadableStream): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    readable.on('data', (chunk: Buffer) => chunks.push(chunk))
    readable.on('end', () => resolve(Buffer.concat(chunks)))
    readable.on('error', reject)
  })
}

// Image pipeline
async function processImage(data: AssetJobData): Promise<void> {
  const stream = await streamFromMinio(data.bucketPath)
  const buffer = await streamToBuffer(stream)
  const meta = await sharp(buffer).metadata()

  const thumbnail = await sharp(buffer)
    .resize(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, {
      fit: 'cover',
      position: 'centre',
    })
    .jpeg({ quality: THUMBNAIL_QUALITY })
    .toBuffer()

  const thumbnailPath = await uploadThumbnailToMinio(thumbnail, data.assetId)

  await assetRepository.updateAfterProcessing(data.assetId, {
    thumbnailPath,
    width: meta.width,
    height: meta.height,
    status: 'ready',
  })
}

// Video pipeline
async function processVideo(data: AssetJobData): Promise<void> {
  const ext = path.extname(data.originalName) || '.mp4'
  const stream = await streamFromMinio(data.bucketPath)
  const buffer = await streamToBuffer(stream)
  const inputPath = await writeBufferToTempFile(buffer, ext)
  const tempFiles: string[] = [inputPath]

  try {
    const meta = await getVideoMetadata(inputPath)

    const thumbFolder = path.dirname(inputPath)
    const thumbFilename = `${data.assetId}-thumb.jpg`
    await generateVideoThumbnail(
      inputPath,
      thumbFolder,
      thumbFilename,
      VIDEO_THUMBNAIL_TIMESTAMP_SEC
    )
    const thumbFullPath = path.join(thumbFolder, thumbFilename)
    tempFiles.push(thumbFullPath)
    const thumbBuffer = await fs.readFile(thumbFullPath)
    const thumbnailPath = await uploadThumbnailToMinio(
      thumbBuffer,
      data.assetId
    )

    const renditions: VideoRendition[] = []
    for (const resolution of VIDEO_RESOLUTIONS) {
      if (meta.height && meta.height < resolution.height) continue

      const outputPath = tempOutputPath('.mp4')
      tempFiles.push(outputPath)
      await transcodeVideo(inputPath, outputPath, resolution.height)

      const renditionBuffer = await fs.readFile(outputPath)
      const bucketPath = await uploadRenditionToMinio(
        renditionBuffer,
        data.assetId,
        resolution.label
      )
      renditions.push({ label: resolution.label, bucketPath })
    }

    await assetRepository.updateAfterProcessing(data.assetId, {
      thumbnailPath,
      width: meta.width,
      height: meta.height,
      status: 'ready',
      renditions,
    })
  } finally {
    // Always clean up temp files
    await cleanupFiles(tempFiles)
  }
}

// Consumer
async function handleMessage(
  msg: ConsumeMessage,
  channel: Channel
): Promise<void> {
  let data: AssetJobData
  try {
    data = JSON.parse(msg.content.toString()) as AssetJobData
  } catch {
    console.error(`[AssetWorker] ${MESSAGES.WORKER_INVALID_MESSAGE_MSG}`)
    channel.nack(msg, false, false) // malformed message — discard, do not requeue
    return
  }

  try {
    await assetRepository.updateStatus(data.assetId, 'processing')

    const [category] = data.mimeType.split('/')
    if (category === 'image') {
      await processImage(data)
    } else if (category === 'video') {
      await processVideo(data)
    } else {
      await assetRepository.updateStatus(data.assetId, 'ready')
    }

    channel.ack(msg)
  } catch (err) {
    console.error(
      `[AssetWorker] ${MESSAGES.WORKER_JOB_FAILED_MSG} (assetId: ${data.assetId}):`,
      (err as Error).message
    )
    await assetRepository.updateStatus(data.assetId, 'failed').catch(() => null)
    channel.nack(msg, false, false) // do not requeue — avoids an infinite retry loop on bad input
  }
}

export async function startAssetWorker(): Promise<void> {
  const channel = await getRabbitChannel()

  await channel.consume(ASSET_QUEUE, (msg) => {
    if (!msg) return
    void handleMessage(msg, channel)
  })

  console.log(`[AssetWorker] ${MESSAGES.WORKER_STARTED_MSG}`)
}
