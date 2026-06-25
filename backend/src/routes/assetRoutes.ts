/*
 ****************************************************************************************************************************
 * Filename    : assetRoutes
 * Description : Asset upload feature routes. All routes require authentication — view/thumbnail/download
 *               also check that the requester owns the asset or has an active AssetShare for it.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-17
 ****************************************************************************************************************************
 */

import express from 'express'
import { authMiddleware } from '../middleware'
import {
  uploadMiddleware,
  uploadAssets,
  listAssets,
  streamAsset,
  streamThumbnail,
  downloadAsset,
  deleteAsset,
} from '../controllers'

const router = express.Router()

router.post('/upload', authMiddleware, uploadMiddleware, uploadAssets)
router.get('/', authMiddleware, listAssets)
router.delete('/:id', authMiddleware, deleteAsset)
router.get('/:id/view', authMiddleware, streamAsset)
router.get('/:id/thumbnail', authMiddleware, streamThumbnail)
router.get('/:id/download', authMiddleware, downloadAsset)

export default router
