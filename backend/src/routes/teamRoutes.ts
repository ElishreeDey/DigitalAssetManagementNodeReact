/*
 ****************************************************************************************************************************
 * Filename    : teamRoutes
 * Description : Team and team membership routes.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-24
 ****************************************************************************************************************************
 */

import express from 'express'
import { authMiddleware } from '../middleware'
import {
  createTeam,
  listTeams,
  listMembers,
  addMember,
  removeMember,
  deleteTeam,
} from '../controllers'

const router = express.Router()

router.post('/', authMiddleware, createTeam)
router.get('/', authMiddleware, listTeams)
router.delete('/:id', authMiddleware, deleteTeam)
router.get('/:id/members', authMiddleware, listMembers)
router.post('/:id/members', authMiddleware, addMember)
router.delete('/:id/members/:userId', authMiddleware, removeMember)

export default router
