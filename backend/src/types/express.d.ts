/*
 ****************************************************************************************************************************
 * Filename    : express.d.ts
 * Description : Augments the Express Request interface to carry the decoded JWT payload after auth middleware runs.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-12
 ****************************************************************************************************************************
 */

import { JwtPayload } from './authTypes'

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}
