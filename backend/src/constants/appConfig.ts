/*
 ****************************************************************************************************************************
 * Filename    : appConfig
 * Description : Application-level configuration constants — every magic number and fixed string lives here
 *               so business logic files stay free of inline literals.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-15
 ****************************************************************************************************************************
 */

/* ── Bcrypt ──────────────────────────────────────────────────────────────── */

// 10 rounds balances security and CPU cost (~100ms per hash on modern hardware).
// Increase to 12 for higher-security environments at the cost of slower login.
export const SALT_ROUNDS = 10

/* ── Password rules ──────────────────────────────────────────────────────── */

export const PASSWORD_MIN_LENGTH = 6

/* ── JWT ─────────────────────────────────────────────────────────────────── */

export const JWT_EXPIRES_IN = '1d'

/* ── Auth cookie ─────────────────────────────────────────────────────────── */

// Must match JWT_EXPIRES_IN so the cookie and token expire together.
export const COOKIE_NAME = 'token'
export const COOKIE_MAX_AGE_MS = 24 * 60 * 60 * 1000 // 1 day in ms

/* ── Express ─────────────────────────────────────────────────────────────── */

// Caps the JSON body size so oversized payloads are rejected before parsing.
export const JSON_BODY_LIMIT = '10kb'

// Explicit allowlist keeps the API surface minimal in production.
export const CORS_METHODS = ['GET', 'POST', 'PUT', 'DELETE']

/* ── API versioning ──────────────────────────────────────────────────────── */

export const API_PREFIX = '/api/v1'

/* ── MinIO ───────────────────────────────────────────────────────────────── */

export const MINIO_BUCKET_REGION = 'us-east-1'

/* ── RabbitMQ ────────────────────────────────────────────────────────────── */

// Queue name is a shared constant so the API (publisher) and Worker (consumer)
// always reference the same string without importing from each other.
export const ASSET_QUEUE_NAME = 'asset-processing'

/* ── File upload ─────────────────────────────────────────────────────────── */

export const UPLOAD_MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024 // 50 MB
export const UPLOAD_MAX_FILES = 20
export const UPLOAD_ACCEPTED_MIME_REGEX = /^(image|video)\//

/* ── Thumbnail generation ────────────────────────────────────────────────── */

export const THUMBNAIL_WIDTH = 400
export const THUMBNAIL_HEIGHT = 400
export const THUMBNAIL_QUALITY = 80 // JPEG quality 0-100

/* ── Video transcoding ───────────────────────────────────────────────────── */

// Renditions the worker generates for every uploaded video. Heights only — width is
// derived by ffmpeg via "-2" to preserve the source aspect ratio.
// A rendition is skipped if the source video is shorter (no upscaling).
export const VIDEO_RESOLUTIONS: { label: string; height: number }[] = [
  { label: '1080p', height: 1080 },
  { label: '720p', height: 720 },
]

// Timestamp (seconds into the video) used to capture the thumbnail frame
export const VIDEO_THUMBNAIL_TIMESTAMP_SEC = 1
