/*
 ****************************************************************************************************************************
 * Filename    : userRepository
 * Description : All direct database calls for the users table — no business logic lives here.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-12
 ****************************************************************************************************************************
 */

import User from '../models/userModel'
import type { UserCreateBody, UserUpdateBody } from '../types/userTypes'

export class UserRepository {
  async createUser(data: UserCreateBody) {
    return User.create(data as unknown as Record<string, unknown>)
  }

  async getUsers() {
    return User.findAll({ order: [['id', 'DESC']] })
  }

  async getUserById(id: number) {
    return User.findByPk(id)
  }

  async updateUser(id: number, data: UserUpdateBody) {
    const user = await User.findByPk(id)
    if (!user) return null
    return user.update(data as Record<string, unknown>)
  }

  async deleteUser(id: number) {
    const user = await User.findByPk(id)
    if (!user) return null
    await user.destroy()
    return true
  }
}
