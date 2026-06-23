/*
 ****************************************************************************************************************************
 * Filename    : auth
 * Description : Authentication constants.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-12
 ****************************************************************************************************************************
 */

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const PASSWORD_MIN_LENGTH = 6

export const AUTH_ERRORS = {
  EMAIL_REQUIRED: 'Email is required',
  EMAIL_INVALID: 'Enter a valid email address',
  PASSWORD_REQUIRED: 'Password is required',
  PASSWORD_MIN_LENGTH: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
  CONFIRM_PASSWORD_REQUIRED: 'Please confirm your password',
  PASSWORDS_DO_NOT_MATCH: 'Passwords do not match',

  // Fallback message for network or unexpected server errors.
  LOGIN_FAILED: 'Invalid email or password. Please try again.',
  REGISTER_FAILED: 'Registration failed. Please try again.',
} as const

export const AUTH_TOAST = {
  LOGIN_SUCCESS: 'Login successful! Redirecting…',
  REGISTER_SUCCESS: 'Account created! Please sign in.',
} as const

export const AUTH_ENDPOINTS = {
  LOGIN: '/login',
  REGISTER: '/register',
  LOGOUT: '/logout',
  ME: '/curLoggedInUser',
} as const
