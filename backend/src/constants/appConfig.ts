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
