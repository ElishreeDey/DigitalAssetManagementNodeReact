/*
 ****************************************************************************************************************************
 * Filename    : authUserRepository
 * Description : Database operations for authentication users.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-12
 ****************************************************************************************************************************
 */

import { AuthUser } from '../models'
import type { UserRole } from '../types'

export class AuthUserRepository {
  async findByEmail(email: string) {
    return AuthUser.findOne({ where: { email } })
  }

  async createAuthUser(
    email: string,
    passwordHash: string,
    role: UserRole = 'viewer'
  ) {
    // Type assertion required for Sequelize create() typing.
    return AuthUser.create({ email, passwordHash, role } as Record<
      string,
      unknown
    >)
  }
}
