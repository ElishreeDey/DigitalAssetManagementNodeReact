/*
 ****************************************************************************************************************************
 * Filename    : authHelper.test
 * Description : Unit tests for JWT helper utilities — generateToken and verifyToken.
 *               These are pure functions with no external I/O, so no mocking is needed.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-30
 ****************************************************************************************************************************
 */

import { describe, it, expect } from 'vitest'
import { generateToken, verifyToken } from '../../helpers/authHelper'

describe('authHelper', () => {
  // Reusable payload used across all token tests.
  const payload = {
    userId: 'user-abc-123',
    email: 'test@example.com',
  }

  describe('generateToken', () => {
    it('returns a JWT string with three dot-separated parts', () => {
      const token = generateToken(payload)
      expect(typeof token).toBe('string')
      // A valid JWT always has exactly three base64url segments separated by dots.
      expect(token.split('.').length).toBe(3)
    })

    it('produces different tokens for different payloads', () => {
      const token1 = generateToken(payload)
      const token2 = generateToken({ ...payload, userId: 'other-user' })
      // Different payloads must encode to different tokens.
      expect(token1).not.toBe(token2)
    })
  })

  describe('verifyToken', () => {
    it('decodes a valid token back to the original payload fields', () => {
      const token = generateToken(payload)
      const decoded = verifyToken(token)
      expect(decoded.userId).toBe(payload.userId)
      expect(decoded.email).toBe(payload.email)
    })

    it('throws on a completely invalid token string', () => {
      expect(() => verifyToken('not.a.token')).toThrow()
    })

    it('throws on a tampered token signature', () => {
      const token = generateToken(payload)
      // Replace the last 4 characters of the signature segment to simulate tampering.
      const tampered = token.slice(0, -4) + 'XXXX'
      expect(() => verifyToken(tampered)).toThrow()
    })
  })
})
