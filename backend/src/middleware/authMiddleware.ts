/*
 ****************************************************************************************************************************
 * Filename    : authMiddleware
 * Description : Reads the JWT from the httpOnly cookie, verifies it, and attaches the decoded payload to req.user
 *               so downstream controllers can access userId, email, and role without re-reading the token.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-12
 ****************************************************************************************************************************
 */

import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../helpers'
import { MESSAGES } from '../constants'
import { COOKIE_NAME } from '../constants'

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // The cookie is httpOnly so JS cannot read it — the browser attaches it automatically.
    const token = req.cookies?.[COOKIE_NAME] as string | undefined

    if (!token) {
      return res.status(401).json({ message: MESSAGES.TOKEN_MISSING_MSG })
    }

    // verifyToken throws on expiry or bad signature; the catch block below handles both.
    const decoded = verifyToken(token)
    req.user = decoded
    next()
  } catch {
    return res.status(401).json({ message: MESSAGES.INVALID_TOKEN_MSG })
  }
}
