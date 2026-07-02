/*
 ****************************************************************************************************************************
 * Filename    : authService.test
 * Description : Unit tests for the authentication service — login, register, logout,
 *               curLoggedInUser, and listAccounts. The shared Axios instance is mocked
 *               so no real HTTP calls are made during the test run.
 * Author      : Elishree Dey Chand
 * Created     : 2026-07-01
 ****************************************************************************************************************************
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the shared axios instance before importing the service.
vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}))

import { authService } from '../../services/authService'
import api from '../../services/api'

const mockApi = vi.mocked(api)

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  //login
  describe('login', () => {
    it('calls POST /login with the provided email and password', async () => {
      mockApi.post.mockResolvedValue({})
      await authService.login('user@example.com', 'pass123')
      expect(mockApi.post).toHaveBeenCalledWith('/login', {
        email: 'user@example.com',
        password: 'pass123',
      })
    })

    it('propagates the error when the request fails', async () => {
      mockApi.post.mockRejectedValue(new Error('401'))
      await expect(authService.login('x@y.com', 'wrong')).rejects.toThrow('401')
    })
  })

  //register user
  describe('register', () => {
    it('calls POST /register with email and password', async () => {
      mockApi.post.mockResolvedValue({})
      await authService.register('new@example.com', 'newpass123')
      expect(mockApi.post).toHaveBeenCalledWith('/register', {
        email: 'new@example.com',
        password: 'newpass123',
      })
    })
  })

  //logout
  describe('logout', () => {
    it('calls POST /logout', async () => {
      mockApi.post.mockResolvedValue({})
      await authService.logout()
      expect(mockApi.post).toHaveBeenCalledWith('/logout')
    })
  })

  //curLoggedInUser
  describe('curLoggedInUser', () => {
    it('calls GET /curLoggedInUser and returns the user data', async () => {
      const user = { userId: 'u1', email: 'user@example.com' }
      mockApi.get.mockResolvedValue({ data: user })
      const result = await authService.curLoggedInUser()
      expect(mockApi.get).toHaveBeenCalledWith('/curLoggedInUser')
      expect(result).toEqual(user)
    })
  })

  describe('listAccounts', () => {
    it('calls GET /accounts and returns the account list', async () => {
      const accounts = [
        { id: 'u1', email: 'a@b.com' },
        { id: 'u2', email: 'c@d.com' },
      ]
      mockApi.get.mockResolvedValue({ data: accounts })
      const result = await authService.listAccounts()
      expect(mockApi.get).toHaveBeenCalledWith('/accounts')
      expect(result).toEqual(accounts)
    })
  })
})
