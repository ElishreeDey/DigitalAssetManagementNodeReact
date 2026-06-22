/*
 ****************************************************************************************************************************
 * Filename    : assetService
 * Description : MinIO storage operations and asset upload feature.
 *               All direct MinIO SDK calls are isolated here — controllers and workers call these functions.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-16
 ****************************************************************************************************************************
 */

import { randomUUID } from 'crypto'
import path from 'path'
import type { Readable } from 'stream'
import { minioClient, BUCKET_NAME } from '../config'
import { MESSAGES } from '../constants'

// Storage name
// Generates a UUID-based filename to use in MinIO, preserving the original extension.
// The original filename is stored only in the DB — MinIO never sees user-supplied names
// which prevents path traversal and filename collision issues.
export function generateStoredName(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase()
  return `${randomUUID()}${ext}`
}

// MinIO upload
export async function uploadToMinio(
  buffer: Buffer,
  storedName: string,
  mimeType: string
): Promise<string> {
  try {
    await minioClient.putObject(
      BUCKET_NAME,
      storedName,
      buffer,
      buffer.length,
      {
        'Content-Type': mimeType,
      }
    )
    return storedName
  } catch (err) {
    throw new Error(
      `${MESSAGES.MINIO_UPLOAD_FAILED_MSG}: ${(err as Error).message}`,
      { cause: err }
    )
  }
}

// Thumbnails are stored under a 'thumbnails/' prefix to separate them from originals.
export async function uploadThumbnailToMinio(
  buffer: Buffer,
  assetId: string
): Promise<string> {
  const thumbnailName = `thumbnails/${assetId}.jpg`
  try {
    await minioClient.putObject(
      BUCKET_NAME,
      thumbnailName,
      buffer,
      buffer.length,
      {
        'Content-Type': 'image/jpeg',
      }
    )
    return thumbnailName
  } catch (err) {
    throw new Error(
      `${MESSAGES.MINIO_UPLOAD_FAILED_MSG}: ${(err as Error).message}`,
      { cause: err }
    )
  }
}

// Uploads a transcoded video rendition
// Renditions are stored under a 'renditions/' prefix, separate from originals and thumbnails.
export async function uploadRenditionToMinio(
  buffer: Buffer,
  assetId: string,
  label: string
): Promise<string> {
  const renditionName = `renditions/${assetId}-${label}.mp4`
  try {
    await minioClient.putObject(
      BUCKET_NAME,
      renditionName,
      buffer,
      buffer.length,
      {
        'Content-Type': 'video/mp4',
      }
    )
    return renditionName
  } catch (err) {
    throw new Error(
      `${MESSAGES.MINIO_UPLOAD_FAILED_MSG}: ${(err as Error).message}`,
      { cause: err }
    )
  }
}

// MinIO stream
// Returns a readable stream for a stored object — used by view/download endpoints.
export async function streamFromMinio(bucketPath: string): Promise<Readable> {
  try {
    return await minioClient.getObject(BUCKET_NAME, bucketPath)
  } catch (err) {
    throw new Error(
      `${MESSAGES.MINIO_STREAM_FAILED_MSG}: ${(err as Error).message}`,
      { cause: err }
    )
  }
}

// MinIO delete. Removes a single object from MinIO.
export async function deleteFromMinio(bucketPath: string): Promise<void> {
  try {
    await minioClient.removeObject(BUCKET_NAME, bucketPath)
  } catch (err) {
    throw new Error(
      `${MESSAGES.MINIO_DELETE_FAILED_MSG}: ${(err as Error).message}`,
      { cause: err }
    )
  }
}

// Auto-tagging
// Produces an array of descriptive tags from the file's metadata. These are stored in the DB and used for filtering.
export function generateTags(
  originalName: string,
  mimeType: string,
  size: number
): string[] {
  const tags = new Set<string>()

  // Category and subtype from MIME — e.g. 'image', 'jpeg'
  const [category, subtype] = mimeType.split('/')
  if (category) tags.add(category)
  if (subtype) tags.add(subtype)

  // File extension — e.g. 'jpg', 'mp4'
  const ext = path.extname(originalName).replace('.', '').toLowerCase()
  if (ext) tags.add(ext)

  // Size bucket — lets users filter by rough file size
  if (size < 1024 * 1024)
    tags.add('small') // < 1 MB
  else if (size < 10 * 1024 * 1024)
    tags.add('medium') // 1–10 MB
  else tags.add('large') // > 10 MB

  // Keywords from the filename — split on common separators, skip very short words
  const STOP_WORDS = new Set([
    'the',
    'and',
    'for',
    'img',
    'image',
    'video',
    'file',
  ])
  const nameWithoutExt = path.basename(originalName, path.extname(originalName))
  nameWithoutExt
    .toLowerCase()
    .split(/[\s_\-.()[\]]+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word))
    .forEach((word) => tags.add(word))

  return Array.from(tags)
}
