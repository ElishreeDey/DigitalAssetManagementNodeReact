/*
 ****************************************************************************************************************************
 * Filename    : keys
 * Description : Single source of truth for all environment variables. Validates every required var at startup
 *               and exports typed constants — no other file reads process.env directly.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-12
 ****************************************************************************************************************************
 */

import dotenv from 'dotenv'
import { MESSAGES } from '../constants/messages'

dotenv.config()

const REQUIRED_VARS = [
  'JWT_SECRET',
  'CLIENT_URL',
  'DB_HOST',
  'DB_PORT',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
]

const missingVars = REQUIRED_VARS.filter((key) => !process.env[key])
if (missingVars.length > 0) {
  throw new Error(
    `${MESSAGES.MISSING_REQUIRED_ENV_MSG} ${missingVars.join(', ')}`
  )
}

export const keys = {
  port: Number(process.env.PORT) || 3000,
  clientUrl: process.env.CLIENT_URL as string,
  jwtSecret: process.env.JWT_SECRET as string,
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX) || 100,
  db: {
    host: process.env.DB_HOST as string,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER as string,
    password: process.env.DB_PASSWORD as string,
    name: process.env.DB_NAME as string,
  },
}
