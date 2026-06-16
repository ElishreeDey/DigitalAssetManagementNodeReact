/*
 ****************************************************************************************************************************
 * Filename    : minio
 * Description : MinIO client configuration — exposes a single shared Client instance and BUCKET_NAME used
 *               across all storage operations (upload, stream, delete).
 *               ensureBucket() is called once at server startup to guarantee the target bucket exists
 *               before any upload request is accepted.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-16
 ****************************************************************************************************************************
 */

import { Client } from 'minio'
import { keys } from './keys'
import { MESSAGES, MINIO_BUCKET_REGION } from '../constants'

// Single MinIO client shared across the app — creating multiple clients wastes connections
export const minioClient = new Client({
  endPoint: keys.minio.endPoint,
  port: keys.minio.port,
  useSSL: keys.minio.useSSL, // must be true in production (port 443)
  accessKey: keys.minio.accessKey,
  secretKey: keys.minio.secretKey,
})

// Derived from env so changing the bucket name requires only an env change, not a code change
export const BUCKET_NAME = keys.minio.bucket

// Called once at server startup — creates the bucket if it does not already exist.
// All uploaded files are stored in this single bucket, separated by stored filename (UUID-based).
export async function ensureBucket(): Promise<void> {
  const exists = await minioClient.bucketExists(BUCKET_NAME)
  if (!exists) {
    await minioClient.makeBucket(BUCKET_NAME, MINIO_BUCKET_REGION)
    console.log(
      `[MinIO] ${MESSAGES.MINIO_BUCKET_CREATED_MSG}: "${BUCKET_NAME}"`
    )
  } else {
    console.log(`[MinIO] ${MESSAGES.MINIO_BUCKET_EXISTS_MSG}: "${BUCKET_NAME}"`)
  }
}
