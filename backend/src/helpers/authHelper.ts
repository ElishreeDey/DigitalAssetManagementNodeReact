/*
 ****************************************************************************************************************************
 * Filename    : authHelper
 * Description : JWT utility functions for token generation and verification.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-12
 ****************************************************************************************************************************
 */

import jwt from 'jsonwebtoken'
import { keys } from '../config/keys'
import { JWT_EXPIRES_IN } from '../constants'
import type { JwtPayload } from '../types'

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, keys.jwtSecret, { expiresIn: JWT_EXPIRES_IN })
}

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, keys.jwtSecret) as JwtPayload
}
