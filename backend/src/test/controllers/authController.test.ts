/*
 ****************************************************************************************************************************
 * Filename    : authController.test
 * Description : Unit tests for register, login, logout, curLoggedInUser, and listAccounts endpoints.
 *               Repository, authService, and token helper are all mocked so no DB or bcrypt
 *               calls are made during the test run.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-30
 ****************************************************************************************************************************
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// vi.hoisted ensures these mock functions are available when vi.mock
const {
  mockFindByEmail,
  mockCreateAuthUser,
  mockListDirectory,
  mockHashPassword,
  mockVerifyPassword,
} = vi.hoisted(() => ({
  mockFindByEmail: vi.fn(),
  mockCreateAuthUser: vi.fn(),
  mockListDirectory: vi.fn(),
  mockHashPassword: vi.fn(),
  mockVerifyPassword: vi.fn(),
}))

// AuthUserRepository is instantiated at module level in authController.ts
vi.mock('../../repositories/authUserRepository', () => ({
  AuthUserRepository: vi.fn(function () {
    return {
      findByEmail: mockFindByEmail,
      createAuthUser: mockCreateAuthUser,
      listDirectory: mockListDirectory,
    }
  }),
}))

vi.mock('../../services/authService', () => ({
  authService: {
    hashPassword: mockHashPassword,
    verifyPassword: mockVerifyPassword,
  },
}))

// generateToken is mocked with a fixed return value so cookie assertions are deterministic.
vi.mock('../../helpers/authHelper', () => ({
  generateToken: vi.fn().mockReturnValue('mock-jwt-token'),
}))

import {
  register,
  login,
  logout,
  curLoggedInUser,
  listAccounts,
} from '../../controllers/authController'
import { MESSAGES } from '../../constants'

describe('authController', () => {
  const mockNext = vi.fn()

  // Builds a chainable mock response (res.status(x).json(y) pattern).
  function makeRes() {
    const res = {
      status: vi.fn(),
      json: vi.fn(),
      cookie: vi.fn(),
      clearCookie: vi.fn(),
    }
    res.status.mockReturnValue(res)
    res.json.mockReturnValue(res)
    res.cookie.mockReturnValue(res)
    res.clearCookie.mockReturnValue(res)
    return res as any
  }

  beforeEach(() => {
    // Clear call history so tests do not bleed into each other.
    vi.clearAllMocks()
  })

  // register
  describe('register', () => {
    it('returns 400 when email is missing', async () => {
      const req = { body: { password: 'secret123' } } as any
      const res = makeRes()
      await register(req, res, mockNext)
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        message: MESSAGES.EMAIL_REQUIRED_MSG,
      })
    })

    it('returns 400 when password is missing', async () => {
      const req = { body: { email: 'user@example.com' } } as any
      const res = makeRes()
      await register(req, res, mockNext)
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        message: MESSAGES.PASSWORD_REQUIRED_MSG,
      })
    })

    it('returns 400 when password is shorter than 6 characters', async () => {
      const req = {
        body: { email: 'user@example.com', password: 'abc' },
      } as any
      const res = makeRes()
      await register(req, res, mockNext)
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        message: MESSAGES.PASSWORD_TOO_SHORT_MSG,
      })
    })

    it('returns 409 when email is already registered', async () => {
      // findByEmail returns an existing user — duplicate account scenario.
      mockFindByEmail.mockResolvedValue({ id: 'u1', email: 'user@example.com' })
      const req = {
        body: { email: 'user@example.com', password: 'password123' },
      } as any
      const res = makeRes()
      await register(req, res, mockNext)
      expect(res.status).toHaveBeenCalledWith(409)
      expect(res.json).toHaveBeenCalledWith({
        message: MESSAGES.EMAIL_ALREADY_EXISTS_MSG,
      })
    })

    it('sets a JWT cookie and returns 201 on successful registration', async () => {
      mockFindByEmail.mockResolvedValue(null)
      mockHashPassword.mockResolvedValue('hashed-password')
      mockCreateAuthUser.mockResolvedValue({
        id: 'u1',
        email: 'user@example.com',
        role: 'user',
      })

      const req = {
        body: { email: 'user@example.com', password: 'password123' },
      } as any
      const res = makeRes()
      await register(req, res, mockNext)

      // Token must be placed in an httpOnly cookie, never in the response body.
      expect(res.cookie).toHaveBeenCalledWith(
        'token',
        'mock-jwt-token',
        expect.any(Object)
      )
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith({
        message: MESSAGES.REGISTER_SUCCESS_MSG,
      })
    })

    it('calls next when the repository throws', async () => {
      // Unexpected DB error — controller must forward to errorMiddleware via next().
      mockFindByEmail.mockRejectedValue(new Error('DB error'))
      const req = {
        body: { email: 'user@example.com', password: 'password123' },
      } as any
      const res = makeRes()
      await register(req, res, mockNext)
      expect(mockNext).toHaveBeenCalledOnce()
    })
  })

  // login
  describe('login', () => {
    it('returns 400 when email is missing', async () => {
      const req = { body: { password: 'password123' } } as any
      const res = makeRes()
      await login(req, res, mockNext)
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        message: MESSAGES.EMAIL_REQUIRED_MSG,
      })
    })

    it('returns 401 when no account exists for that email', async () => {
      mockFindByEmail.mockResolvedValue(null)
      const req = {
        body: { email: 'nobody@example.com', password: 'pass123' },
      } as any
      const res = makeRes()
      await login(req, res, mockNext)
      expect(res.status).toHaveBeenCalledWith(401)
      // Generic message intentionally avoids confirming whether the email exists.
      expect(res.json).toHaveBeenCalledWith({
        message: MESSAGES.INVALID_CREDENTIALS_MSG,
      })
    })

    it('returns 401 when the password does not match', async () => {
      mockFindByEmail.mockResolvedValue({
        id: 'u1',
        email: 'user@example.com',
        role: 'user',
        passwordHash: 'hash',
      })
      mockVerifyPassword.mockResolvedValue(false)
      const req = {
        body: { email: 'user@example.com', password: 'wrong-password' },
      } as any
      const res = makeRes()
      await login(req, res, mockNext)
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({
        message: MESSAGES.INVALID_CREDENTIALS_MSG,
      })
    })

    it('sets a JWT cookie and returns 200 on successful login', async () => {
      mockFindByEmail.mockResolvedValue({
        id: 'u1',
        email: 'user@example.com',
        role: 'user',
        passwordHash: 'hash',
      })
      mockVerifyPassword.mockResolvedValue(true)
      const req = {
        body: { email: 'user@example.com', password: 'correct-password' },
      } as any
      const res = makeRes()
      await login(req, res, mockNext)

      expect(res.cookie).toHaveBeenCalledWith(
        'token',
        'mock-jwt-token',
        expect.any(Object)
      )
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: MESSAGES.LOGIN_SUCCESS_MSG,
      })
    })
  })

  // logout
  describe('logout', () => {
    it('clears the auth cookie and returns 200', () => {
      const req = {} as any
      const res = makeRes()
      logout(req, res)
      // Clearing the cookie invalidates the session on the client side.
      expect(res.clearCookie).toHaveBeenCalledWith('token', expect.any(Object))
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: MESSAGES.LOGOUT_SUCCESS_MSG,
      })
    })
  })

  // curLoggedInUser
  describe('curLoggedInUser', () => {
    it('returns the decoded user that authMiddleware attached to req', () => {
      // authMiddleware populates req.user before this handler is called.
      const user = { userId: 'u1', email: 'user@example.com', role: 'user' }
      const req = { user } as any
      const res = makeRes()
      curLoggedInUser(req, res)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(user)
    })
  })

  // listAccounts
  describe('listAccounts', () => {
    it('returns all accounts from the repository', async () => {
      const accounts = [
        { id: 'u1', email: 'a@b.com' },
        { id: 'u2', email: 'c@d.com' },
      ]
      mockListDirectory.mockResolvedValue(accounts)
      const req = {} as any
      const res = makeRes()
      await listAccounts(req, res, mockNext)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(accounts)
    })

    it('calls next when the repository throws', async () => {
      mockListDirectory.mockRejectedValue(new Error('DB error'))
      const req = {} as any
      const res = makeRes()
      await listAccounts(req, res, mockNext)
      expect(mockNext).toHaveBeenCalledOnce()
    })
  })
})
