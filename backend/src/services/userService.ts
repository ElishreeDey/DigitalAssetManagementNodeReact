/*
 ****************************************************************************************************************************
 * Filename    : userService
 * Description : Business logic layer for the users resource — delegates DB operations to UserRepository.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-12
 ****************************************************************************************************************************
 */

import { UserRepository } from '../repositories'
import type { UserCreateBody, UserUpdateBody } from '../types'

const userRepository = new UserRepository()

export class UserService {
  async createUser(data: UserCreateBody) {
    return userRepository.createUser(data)
  }

  async getUsers() {
    return userRepository.getUsers()
  }

  async getUserById(id: number) {
    return userRepository.getUserById(id)
  }

  async updateUser(id: number, data: UserUpdateBody) {
    return userRepository.updateUser(id, data)
  }

  async deleteUser(id: number) {
    return userRepository.deleteUser(id)
  }
}
