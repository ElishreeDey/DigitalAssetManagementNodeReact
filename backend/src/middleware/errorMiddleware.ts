/*
 ****************************************************************************************************************************
 * Filename    : errorMiddleware
 * Description : Centralized Express error handler.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-12
 ****************************************************************************************************************************
 */

import { Request, Response, NextFunction } from 'express'
import { MESSAGES } from '../constants'

export const errorMiddleware = (
  error: Error & { status?: number },
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(`[${MESSAGES.INTERNAL_SERVER_ERROR_MSG}]`, error)

  res
    .status(error.status ?? 500)
    .json({ message: error.message || MESSAGES.SOMETHING_WENT_WRONG_MSG })
}
