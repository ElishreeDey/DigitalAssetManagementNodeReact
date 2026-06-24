/*
 ****************************************************************************************************************************
 * Filename    : userRoutes
 * Description : Registers all API routes for user CRUD endpoints, protected by authMiddleware.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-12
 ****************************************************************************************************************************
 */

import express from 'express'

// Import middleware used to verify authentication/JWT token
import { authMiddleware } from '../middleware'

// Import USER controller functions that contain the actual business logic
import {
  register,
  login,
  logout,
  curLoggedInUser,
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
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

// User CRUD
router.post('/users', authMiddleware, createUser)
router.get('/users', authMiddleware, getUsers)
router.get('/users/:id', authMiddleware, getUserById)
router.put('/users/:id', authMiddleware, updateUser)
router.delete('/users/:id', authMiddleware, deleteUser)

export default router
