/*
 ****************************************************************************************************************************
 * Filename    : rateLimitMiddleware
 * Description : API rate limiting middleware.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-12
 ****************************************************************************************************************************
 */

import rateLimit from 'express-rate-limit'
import { MESSAGES } from '../constants'
import { keys } from '../config'

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: keys.rateLimitMax,
  message: { message: MESSAGES.RATE_LIMIT_EXCEED_MSG },
  standardHeaders: true,
  legacyHeaders: false,
})
