/*
 ****************************************************************************************************************************
 * Filename    : appConfig
 * Description : Application-level configuration constants.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-15
 ****************************************************************************************************************************
 */

// Cost factor used when hashing passwords.
export const SALT_ROUNDS = 10

// Password rules
export const PASSWORD_MIN_LENGTH = 6

// JWT
export const JWT_EXPIRES_IN = '1d'

// Auth cookie
// Keep cookie expiry 1d.
export const COOKIE_NAME = 'token'
export const COOKIE_MAX_AGE_MS = 24 * 60 * 60 * 1000 // 1 day

// Express
// Caps the JSON body size so oversized payloads are rejected before parsing.
export const JSON_BODY_LIMIT = '10kb'

// API routes GET, POST, PATCH, and DELETE
export const CORS_METHODS = ['GET', 'POST', 'PATCH', 'DELETE']

// API versioning
export const API_PREFIX = '/api/v1'

// MinIO
export const MINIO_BUCKET_REGION = 'us-east-1'

// RabbitMQ
// Shared queue name used by both publishers and consumers.
export const ASSET_QUEUE_NAME = 'asset-processing'

// File upload limit max size, max number of upload, file types allowed for upload.
export const UPLOAD_MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024 // 50 MB
export const UPLOAD_MAX_FILES = 10
export const UPLOAD_ACCEPTED_MIME_REGEX = /^(image|video)\/|^application\/pdf$/

// Thumbnail generation
export const THUMBNAIL_WIDTH = 400
export const THUMBNAIL_HEIGHT = 400
export const THUMBNAIL_QUALITY = 80

// Video transcoding
// Video renditions generated for uploaded videos.
export const VIDEO_RESOLUTIONS: { label: string; height: number }[] = [
  { label: '1080p', height: 1080 },
  { label: '720p', height: 720 },
]

// Timestamp (in seconds) used to capture the video thumbnail.
export const VIDEO_THUMBNAIL_TIMESTAMP_SEC = 1
