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

/* ── Validation error messages ───────────────────────────────────────────── */

export const AUTH_ERRORS = {
  EMAIL_REQUIRED: 'Email is required',
  EMAIL_INVALID: 'Enter a valid email address',
  PASSWORD_REQUIRED: 'Password is required',
  PASSWORD_MIN_LENGTH: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
  CONFIRM_PASSWORD_REQUIRED: 'Please confirm your password',
  PASSWORDS_DO_NOT_MATCH: 'Passwords do not match',
  // Generic fallback shown when the server returns no message or the network is down
  LOGIN_FAILED: 'Invalid email or password. Please try again.',
  REGISTER_FAILED: 'Registration failed. Please try again.',
} as const

/* ── Toast (success) messages ────────────────────────────────────────────── */

// Kept separate from AUTH_ERRORS so success and error paths are never mixed up.
export const AUTH_TOAST = {
  LOGIN_SUCCESS: 'Login successful! Redirecting…',
  REGISTER_SUCCESS: 'Account created! Please sign in.',
} as const

/* ── API endpoint paths ──────────────────────────────────────────────────── */

// Centralised here so a backend route rename is a one-line frontend change.
export const AUTH_ENDPOINTS = {
  LOGIN: '/login',
  REGISTER: '/register',
  LOGOUT: '/logout',
  ME: '/me',
} as const
