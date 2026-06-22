/*
 ****************************************************************************************************************************
 * Filename    : authService
 * Description : Password hashing and verification utilities.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-12
 ****************************************************************************************************************************
 */

import bcrypt from 'bcrypt'
import { SALT_ROUNDS } from '../constants'

export const authService = {
  async hashPassword(plainPassword: string): Promise<string> {
    return bcrypt.hash(plainPassword, SALT_ROUNDS)
  },

  async verifyPassword(
    plainPassword: string,
    passwordHash: string
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, passwordHash)
  },
}
