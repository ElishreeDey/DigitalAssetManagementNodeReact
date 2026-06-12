/*
 ****************************************************************************************************************************
 * Filename    : auth
 * Description : Authentication-related constants — email validation regex, password rules, and user-facing error messages
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
  LOGIN_FAILED: 'Invalid email or password. Please try again.',
} as const
