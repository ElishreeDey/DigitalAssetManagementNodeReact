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

  // PDF processing
  PDF_THUMBNAIL_FAILED_MSG: 'Failed to generate PDF thumbnail',

  // Asset CRUD
  ASSET_NOT_FOUND_MSG: 'Asset not found',
  ASSET_NO_FILES_MSG: 'No files were uploaded',
  ASSET_INVALID_TYPE_MSG: 'Only image, video, and PDF files are accepted',
  ASSET_UPLOAD_FAILED_MSG: 'Failed to upload asset',
  ASSET_LIST_FAILED_MSG: 'Failed to fetch assets',
  ASSET_DELETE_FAILED_MSG: 'Failed to delete asset',
  ASSET_DELETE_SUCCESS_MSG: 'Asset deleted successfully',
  ASSET_STREAM_FAILED_MSG: 'Failed to stream asset',
  ASSET_ACCESS_DENIED_MSG: 'You do not have access to this asset',

  // Asset sharing
  ASSET_SHARE_OWNER_ONLY_MSG: 'Only the asset owner can manage sharing',
  ASSET_SHARE_TEAM_ID_REQUIRED_MSG: 'Team id is required',
  ASSET_SHARE_ALREADY_EXISTS_MSG: 'Asset is already shared with this target',
  ASSET_SHARE_CREATE_FAILED_MSG: 'Failed to share asset',
  ASSET_SHARE_FETCH_FAILED_MSG: 'Failed to fetch asset shares',
  ASSET_SHARE_NOT_FOUND_MSG: 'Share not found',
  ASSET_SHARE_REMOVE_FAILED_MSG: 'Failed to remove sharing access',
  ASSET_SHARE_REMOVE_SUCCESS_MSG: 'Sharing access removed successfully',
  ASSET_SHARE_PERMISSION_REQUIRED_MSG:
    "Permission must be 'view' or 'download'",
  ASSET_SHARE_UPDATE_FAILED_MSG: 'Failed to update share',
  ASSET_SHARED_LIST_FAILED_MSG: 'Failed to fetch assets shared with you',

  // Team CRUD
  TEAM_NAME_REQUIRED_MSG: 'Team name is required',
  TEAM_NOT_FOUND_MSG: 'Team not found',
  TEAM_CREATE_FAILED_MSG: 'Failed to create team',
  TEAM_FETCH_FAILED_MSG: 'Failed to fetch teams',
  TEAM_NOT_A_MEMBER_MSG: 'You are not a member of this team',
  TEAM_OWNER_ONLY_MSG: 'Only a team owner can perform this action',
  TEAM_DELETE_FAILED_MSG: 'Failed to delete team',
  TEAM_DELETE_SUCCESS_MSG: 'Team deleted successfully',

  // Team membership
  TEAM_MEMBERS_FETCH_FAILED_MSG: 'Failed to fetch team members',
  TEAM_MEMBER_ADD_FAILED_MSG: 'Failed to add team member',
  TEAM_MEMBER_REMOVE_FAILED_MSG: 'Failed to remove team member',
  TEAM_MEMBER_ALREADY_EXISTS_MSG: 'User is already a member of this team',
  TEAM_MEMBER_NOT_FOUND_MSG: 'Team member not found',
  TEAM_MEMBER_REMOVE_SUCCESS_MSG: 'Team member removed successfully',
  TEAM_LAST_OWNER_MSG: 'Cannot remove the only owner of a team',
} as const
