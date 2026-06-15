/*
 ****************************************************************************************************************************
 * Filename    : authHelper
 * Description : JWT utility functions — signs tokens with a userId + email + role payload and verifies them.
 *               Isolated here so controllers never import jsonwebtoken directly.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-12
 ****************************************************************************************************************************
 */

import jwt from 'jsonwebtoken'
import { keys } from '../config/keys'
import { JWT_EXPIRES_IN } from '../constants/appConfig'
import type { JwtPayload } from '../types/authTypes'

export const generateToken = (payload: JwtPayload): string => {
  // expiresIn is sourced from appConfig so token lifetime is changed in one place.
  return jwt.sign(payload, keys.jwtSecret, { expiresIn: JWT_EXPIRES_IN })
}

export const verifyToken = (token: string): JwtPayload => {
  // jwt.verify throws if the token is expired or the signature is wrong —
  // the caller (authMiddleware) wraps this in a try/catch.
  return jwt.verify(token, keys.jwtSecret) as JwtPayload
}
