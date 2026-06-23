/*
 ****************************************************************************************************************************
 * Filename    : messages
 * Description : Central store for all user-facing and log messages — keeps strings out of business logic.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-12
 ****************************************************************************************************************************
 */

export const MESSAGES = {
  // User CRUD
  USER_CREATE_FAILED_MSG: 'Failed to create user',
  USER_FETCH_FAILED_MSG: 'Failed to fetch users',
  USER_FETCH_SINGLE_FAILED_MSG: 'Failed to fetch user',
  USER_NOT_FOUND_MSG: 'User not found',
  USER_UPDATE_FAILED_MSG: 'Failed to update user',
  USER_DELETE_FAILED_MSG: 'Failed to delete user',
  USER_DELETE_SUCCESS_MSG: 'User deleted successfully',

  // Auth — token
  TOKEN_MISSING_MSG: 'Token missing',
  INVALID_TOKEN_MSG: 'Invalid or expired token',

  // Auth — login / register
  LOGIN_SUCCESS_MSG: 'Login successful',
  LOGIN_FAILED_MSG: 'Login failed',
  LOGOUT_SUCCESS_MSG: 'Logged out successfully',
  REGISTER_SUCCESS_MSG: 'Account created successfully',
  REGISTER_FAILED_MSG: 'Registration failed',
  INVALID_CREDENTIALS_MSG: 'Invalid email or password',
  EMAIL_ALREADY_EXISTS_MSG: 'An account with this email already exists',

  // Validation
  EMAIL_REQUIRED_MSG: 'Email is required',
  PASSWORD_REQUIRED_MSG: 'Password is required',
  PASSWORD_TOO_SHORT_MSG: 'Password must be at least 6 characters',

  // Server / DB
  MISSING_REQUIRED_ENV_MSG: 'Missing required environment variables:',
  INTERNAL_SERVER_ERROR_MSG: 'Internal Server Error',
  SOMETHING_WENT_WRONG_MSG: 'Something went wrong. Please try again later.',
  DB_CON_SUCCESS_MSG: 'Database connected successfully',
  SERVER_RUNNING_ONPORT_MSG: 'Server running on port',
  RATE_LIMIT_EXCEED_MSG: 'Too many requests. Please try again later.',

  // MinIO — startup
  MINIO_BUCKET_CREATED_MSG: 'MinIO bucket created',
  MINIO_BUCKET_EXISTS_MSG: 'MinIO bucket already exists',
  MINIO_INIT_SKIPPED_MSG: 'MinIO bucket init skipped',

  // MinIO — runtime errors
  MINIO_UPLOAD_FAILED_MSG: 'Failed to upload file to object storage',
  MINIO_STREAM_FAILED_MSG: 'Failed to stream file from object storage',
  MINIO_DELETE_FAILED_MSG: 'Failed to delete file from object storage',

  // RabbitMQ — startup
  RABBITMQ_CONNECTED_MSG: 'RabbitMQ connected, queue ready',
  RABBITMQ_CONNECTION_ERROR_MSG: 'RabbitMQ connection error',
  RABBITMQ_PUBLISH_FAILED_MSG: 'Failed to publish job to queue',

  // Worker
  WORKER_STARTED_MSG: 'Asset worker started, listening for jobs',
  WORKER_JOB_FAILED_MSG: 'Asset processing job failed',
  WORKER_INVALID_MESSAGE_MSG: 'Invalid job message received, rejecting',

  // Video processing
  VIDEO_PROBE_FAILED_MSG: 'Failed to read video metadata',
  VIDEO_TRANSCODE_FAILED_MSG: 'Failed to transcode video',
  VIDEO_THUMBNAIL_FAILED_MSG: 'Failed to generate video thumbnail',

  // Asset CRUD
  ASSET_NOT_FOUND_MSG: 'Asset not found',
  ASSET_NO_FILES_MSG: 'No files were uploaded',
  ASSET_INVALID_TYPE_MSG: 'Only image, video, and PDF files are accepted',
  ASSET_UPLOAD_FAILED_MSG: 'Failed to upload asset',
  ASSET_LIST_FAILED_MSG: 'Failed to fetch assets',
  ASSET_DELETE_FAILED_MSG: 'Failed to delete asset',
  ASSET_DELETE_SUCCESS_MSG: 'Asset deleted successfully',
  ASSET_STREAM_FAILED_MSG: 'Failed to stream asset',
} as const
