/*
 ****************************************************************************************************************************
 * Filename    : index
 * Description : Barrel — combines user/auth routes with asset routes (mounted under /assets) into one router.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-12
 ****************************************************************************************************************************
 */

import { Router } from 'express'
import userRoutes from './userRoutes'
import assetRoutes from './assetRoutes'

const router = Router()

router.use(userRoutes)
router.use('/assets', assetRoutes)

export default router
