/*
 ****************************************************************************************************************************
 * Filename    : index
 * Description : Barrel index file for all routes.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-12
 ****************************************************************************************************************************
 */

import { Router } from 'express'
import userRoutes from './userRoutes'
import assetRoutes from './assetRoutes'
import teamRoutes from './teamRoutes'

const router = Router()

router.use(userRoutes)
router.use('/assets', assetRoutes)
router.use('/teams', teamRoutes)

export default router
