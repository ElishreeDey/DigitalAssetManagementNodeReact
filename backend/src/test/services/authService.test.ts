/*
 ****************************************************************************************************************************
 * Filename    : authService.test
 * Description : Unit tests for password hashing and verification (using bcrypt library).
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-30
 ****************************************************************************************************************************
 */

import { describe, it, expect } from 'vitest'
import { authService } from '../../services/authService'

describe('authService', () => {
  // All tests reuse this password to keep fixture data consistent.
  const plainPassword = 'MySecurePassword123'

  describe('hashPassword', () => {
    it('returns a bcrypt hash string (starts with $2b$)', async () => {
      const hash = await authService.hashPassword(plainPassword)
      // bcrypt v2b format prefix confirms the correct algorithm.
      expect(hash).toMatch(/^\$2b\$/)
    })

    // Each call generates a random unpredictable sequence of extra characters, so identical passwords with different hashes.
    it('produces a different hash each time (salted)', async () => {
      const hash1 = await authService.hashPassword(plainPassword)
      const hash2 = await authService.hashPassword(plainPassword)

      expect(hash1).not.toBe(hash2)
    })
  })

  describe('verifyPassword', () => {
    it('returns true when the plain password matches the hash', async () => {
      const hash = await authService.hashPassword(plainPassword)
      const result = await authService.verifyPassword(plainPassword, hash)
      expect(result).toBe(true)
    })

    it('returns false when the plain password does not match the hash', async () => {
      const hash = await authService.hashPassword(plainPassword)
      const result = await authService.verifyPassword('WrongPassword!', hash)
      expect(result).toBe(false)
    })

    it('returns false when given a completely invalid hash string', async () => {
      const result = await authService.verifyPassword(
        plainPassword,
        'not-a-hash'
      )
      expect(result).toBe(false)
    })
  })
})
