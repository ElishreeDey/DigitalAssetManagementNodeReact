/*
 ****************************************************************************************************************************
 * Filename    : authUserRepository
 * Description : Database queries for the auth_users table — find by email and create new accounts.
 *               Controllers never import Sequelize models directly; they go through this repository.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-12
 ****************************************************************************************************************************
 */

import { AuthUser } from '../models'
import type { UserRole } from '../types'

export class AuthUserRepository {
  async findByEmail(email: string) {
    // email is stored lowercase at write time, so callers must normalise before passing in.
    return AuthUser.findOne({ where: { email } })
  }

  async createAuthUser(
    email: string,
    passwordHash: string,
    role: UserRole = 'viewer'
  ) {
    // Double-cast is required because Sequelize's create() typing is overly broad.
    return AuthUser.create({ email, passwordHash, role } as Record<
      string,
      unknown
    >)
  }
}
