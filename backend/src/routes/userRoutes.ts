/*
 ****************************************************************************************************************************
 * Filename    : userRoutes
 * Description : Registers authentication routes — register, login, logout, current-user, and account directory.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-12
 ****************************************************************************************************************************
 */

import express from 'express'

// Import middleware used to verify authentication/JWT token
import { authMiddleware } from '../middleware'

// Import controller functions that contain the actual business logic
import {
  register,
  login,
  logout,
  curLoggedInUser,
  listAccounts,
} from '../controllers'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.post('/logout', logout)

// Auth checks whether the supplied JWT token is valid.
router.get('/verify', authMiddleware, (_req, res) =>
  res.status(200).json({ valid: true })
)
router.get('/curLoggedInUser', authMiddleware, curLoggedInUser)
router.get('/accounts', authMiddleware, listAccounts)

export default router
