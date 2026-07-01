/*
 ****************************************************************************************************************************
 * Filename    : authUserRepository
 * Description : Database operations for authentication users.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-12
 ****************************************************************************************************************************
 */

import { AuthUser } from '../models'

export class AuthUserRepository {
  async findByEmail(email: string) {
    return AuthUser.findOne({ where: { email } })
  }

  async createAuthUser(email: string, passwordHash: string) {
    // Type assertion required for Sequelize create() typing.
    return AuthUser.create({ email, passwordHash } as Record<string, unknown>)
  }

  async listDirectory(): Promise<{ id: string; email: string }[]> {
    const users = await AuthUser.findAll({
      attributes: ['id', 'email'],
      order: [['email', 'ASC']],
    })
    return users.map((u) => ({ id: u.id, email: u.email }))
  }
}
