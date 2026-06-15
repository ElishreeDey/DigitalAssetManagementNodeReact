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
} as const
