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
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
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

    // Validate inputs before sending to database.
    if (!email?.trim()) {
      return res.status(400).json({ message: MESSAGES.EMAIL_REQUIRED_MSG })
    }
    if (!password) {
      return res.status(400).json({ message: MESSAGES.PASSWORD_REQUIRED_MSG })
    }
    if (password.length < PASSWORD_MIN_LENGTH) {
      return res.status(400).json({ message: MESSAGES.PASSWORD_TOO_SHORT_MSG })
    }

    // Check for duplicates Email address while authenticating User and show error if any.
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

    // Generate token
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

    // If authentication fails show invalid credential msg
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
  res.clearCookie(COOKIE_NAME, { httpOnly: true, sameSite: 'strict' })
  res.status(200).json({ message: MESSAGES.LOGOUT_SUCCESS_MSG })
}

// GET /curLoggedInUser
export const curLoggedInUser = (req: Request, res: Response) => {
  res.status(200).json(req.user)
}
