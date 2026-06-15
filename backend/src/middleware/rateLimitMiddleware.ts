/*
 ****************************************************************************************************************************
 * Filename    : rateLimitMiddleware
 * Description : Applies per-IP rate limiting to all API routes to prevent brute-force and spam requests.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-12
 ****************************************************************************************************************************
 */

import rateLimit from 'express-rate-limit'
import { MESSAGES } from '../constants/messages'
import { keys } from '../config/keys'

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: keys.rateLimitMax,
  message: { message: MESSAGES.RATE_LIMIT_EXCEED_MSG },
  standardHeaders: true,
  legacyHeaders: false,
})
