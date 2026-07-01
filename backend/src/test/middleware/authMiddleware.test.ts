/*
 ****************************************************************************************************************************
 * Filename    : authMiddleware.test
 * Description : Unit tests for the JWT authentication middleware.
 *               verifyToken is mocked via the helpers barrel so tests control
 *               exactly what the token decode returns or throws.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-30
 ****************************************************************************************************************************
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MESSAGES } from '../../constants'

// vi.mock is hoisted to the top of the compiled output by vitest — it runs before any import statement.
vi.mock('../../helpers', () => ({
  verifyToken: vi.fn(),
}))

import { authMiddleware } from '../../middleware/authMiddleware'
import { verifyToken } from '../../helpers'

const mockVerifyToken = vi.mocked(verifyToken)

describe('authMiddleware', () => {
  const mockNext = vi.fn()

  // Builds a minimal req with a cookie and a chainable res mock.
  function makeReqRes(cookieToken?: string) {
    const req = {
      cookies: cookieToken ? { token: cookieToken } : {},
    } as Parameters<typeof authMiddleware>[0]
    const res = {
      status: vi.fn(),
      json: vi.fn(),
    }
    res.status.mockReturnValue(res)
    res.json.mockReturnValue(res)
    return { req, res }
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls next() and sets req.user when the token is valid', () => {
    const user = { userId: 'u1', email: 'a@b.com' }
    mockVerifyToken.mockReturnValue(user as any)

    const { req, res } = makeReqRes('valid-token')
    authMiddleware(req, res as any, mockNext)

    expect(mockVerifyToken).toHaveBeenCalledWith('valid-token')
    // Middleware must attach the decoded payload so controllers can read req.user.
    expect(req.user).toEqual(user)
    expect(mockNext).toHaveBeenCalledOnce()
    expect((res as any).status).not.toHaveBeenCalled()
  })

  it('returns 401 with TOKEN_MISSING_MSG when no cookie is present', () => {
    const { req, res } = makeReqRes() // no cookie
    authMiddleware(req, res as any, mockNext)

    expect((res as any).status).toHaveBeenCalledWith(401)
    expect((res as any).json).toHaveBeenCalledWith({
      message: MESSAGES.TOKEN_MISSING_MSG,
    })
    expect(mockNext).not.toHaveBeenCalled()
  })

  it('returns 401 with INVALID_TOKEN_MSG when verifyToken throws', () => {
    mockVerifyToken.mockImplementation(() => {
      throw new Error('jwt expired')
    })

    const { req, res } = makeReqRes('expired-token')
    authMiddleware(req, res as any, mockNext)

    expect((res as any).status).toHaveBeenCalledWith(401)
    expect((res as any).json).toHaveBeenCalledWith({
      message: MESSAGES.INVALID_TOKEN_MSG,
    })
    expect(mockNext).not.toHaveBeenCalled()
  })
})
