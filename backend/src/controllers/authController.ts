/*
 ****************************************************************************************************************************
 * Filename    : authController
 * Description : Handles register, login, logout, and curLoggedInUser endpoints.
 *               Passwords are hashed with bcrypt; JWT is stored in an httpOnly cookie (never in the response body).
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-12
 ****************************************************************************************************************************
 */

import { Request, Response, NextFunction } from 'express'
import { authService } from '../services/authService'
import { AuthUserRepository } from '../repositories/authUserRepository'
import { generateToken } from '../helpers/authHelper'
import { MESSAGES } from '../constants/messages'
import {
  COOKIE_NAME,
  COOKIE_MAX_AGE_MS,
  PASSWORD_MIN_LENGTH,
} from '../constants/appConfig'
import type { RegisterBody, LoginBody } from '../types/authTypes'

const authUserRepository = new AuthUserRepository()

// Cookie options are defined once so register, login, and logout all use identical settings.
const COOKIE_OPTIONS = {
  httpOnly: true, // JS cannot read this cookie — prevents XSS token theft
  secure: process.env.NODE_ENV === 'production', // HTTPS-only in production
  sameSite: 'strict' as const, // Blocks cross-site requests (CSRF protection)
  maxAge: COOKIE_MAX_AGE_MS,
}

// POST /register
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body as RegisterBody

    // Validate inputs before touching the database.
    if (!email?.trim()) {
      return res.status(400).json({ message: MESSAGES.EMAIL_REQUIRED_MSG })
    }
    if (!password) {
      return res.status(400).json({ message: MESSAGES.PASSWORD_REQUIRED_MSG })
    }
    if (password.length < PASSWORD_MIN_LENGTH) {
      return res.status(400).json({ message: MESSAGES.PASSWORD_TOO_SHORT_MSG })
    }

    // Check for duplicates before hashing to avoid unnecessary bcrypt work.
    const existing = await authUserRepository.findByEmail(
      email.trim().toLowerCase()
    )
    if (existing) {
      return res
        .status(409)
        .json({ message: MESSAGES.EMAIL_ALREADY_EXISTS_MSG })
    }

    const passwordHash = await authService.hashPassword(password)
    const authUser = await authUserRepository.createAuthUser(
      email.trim().toLowerCase(),
      passwordHash
    )

    // Issue the JWT immediately on register so the user is logged in right away.
    const token = generateToken({
      userId: authUser.id,
      email: authUser.email,
      role: authUser.role,
    })
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS)

    res.status(201).json({ message: MESSAGES.REGISTER_SUCCESS_MSG })
  } catch (error) {
    ;(error as Error).message = MESSAGES.REGISTER_FAILED_MSG
    next(error)
  }
}

// POST /login
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body as LoginBody

    if (!email?.trim()) {
      return res.status(400).json({ message: MESSAGES.EMAIL_REQUIRED_MSG })
    }
    if (!password) {
      return res.status(400).json({ message: MESSAGES.PASSWORD_REQUIRED_MSG })
    }

    const authUser = await authUserRepository.findByEmail(
      email.trim().toLowerCase()
    )

    // Return the SAME generic message whether the email is unknown or the password is wrong.
    // Distinct messages would let an attacker enumerate registered email addresses.
    if (!authUser) {
      return res.status(401).json({ message: MESSAGES.INVALID_CREDENTIALS_MSG })
    }

    const isValid = await authService.verifyPassword(
      password,
      authUser.passwordHash
    )
    if (!isValid) {
      return res.status(401).json({ message: MESSAGES.INVALID_CREDENTIALS_MSG })
    }

    const token = generateToken({
      userId: authUser.id,
      email: authUser.email,
      role: authUser.role,
    })
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS)

    res.status(200).json({ message: MESSAGES.LOGIN_SUCCESS_MSG })
  } catch (error) {
    ;(error as Error).message = MESSAGES.LOGIN_FAILED_MSG
    next(error)
  }
}

// POST /logout
export const logout = (_req: Request, res: Response) => {
  // Clear options must match the set options (httpOnly + sameSite) or the browser ignores the clear.
  res.clearCookie(COOKIE_NAME, { httpOnly: true, sameSite: 'strict' })
  res.status(200).json({ message: MESSAGES.LOGOUT_SUCCESS_MSG })
}

// GET /me  (requires authMiddleware)
export const curLoggedInUser = (req: Request, res: Response) => {
  // req.user is populated by authMiddleware after verifying the cookie token.
  res.status(200).json(req.user)
}
