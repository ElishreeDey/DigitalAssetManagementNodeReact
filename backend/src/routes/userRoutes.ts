/*
 ****************************************************************************************************************************
 * Filename    : userRoutes
 * Description : Registers all API routes — auth endpoints (public) and user CRUD endpoints (protected by authMiddleware).
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-12
 ****************************************************************************************************************************
 */

import express from 'express'
import { authMiddleware } from '../middleware'
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

// Auth (public)
router.post('/register', register)
router.post('/login', login)
router.post('/logout', logout)

// Auth (protected)
router.get('/verify', authMiddleware, (_req, res) =>
  res.status(200).json({ valid: true })
)
router.get('/me', authMiddleware, curLoggedInUser)

// User CRUD (protected)
router.post('/users', authMiddleware, createUser)
router.get('/users', authMiddleware, getUsers)
router.get('/users/:id', authMiddleware, getUserById)
router.put('/users/:id', authMiddleware, updateUser)
router.delete('/users/:id', authMiddleware, deleteUser)

export default router
