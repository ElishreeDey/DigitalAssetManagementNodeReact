/*
 ****************************************************************************************************************************
 * Filename    : authService
 * Description : Password hashing and verification using bcrypt — pure functions with no Express dependency.
 *               Keeping these here (not in the controller) means they can be unit-tested without an HTTP layer.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-12
 ****************************************************************************************************************************
 */

import bcrypt from 'bcrypt'
import { SALT_ROUNDS } from '../constants'

export const authService = {
  async hashPassword(plainPassword: string): Promise<string> {
    // bcrypt.hash is intentionally slow — SALT_ROUNDS controls the work factor.
    return bcrypt.hash(plainPassword, SALT_ROUNDS)
  },

  async verifyPassword(
    plainPassword: string,
    passwordHash: string
  ): Promise<boolean> {
    // bcrypt.compare is timing-safe; no manual constant-time comparison needed.
    return bcrypt.compare(plainPassword, passwordHash)
  },
}
