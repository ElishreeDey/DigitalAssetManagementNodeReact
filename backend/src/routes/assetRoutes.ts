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
  listSharedAssets,
  streamAsset,
  streamThumbnail,
  downloadAsset,
  deleteAsset,
  shareAsset,
  listAssetShares,
  deleteShare,
  updateSharePermission,
} from '../controllers'

const router = express.Router()

router.post('/upload', authMiddleware, uploadMiddleware, uploadAssets)
router.get('/', authMiddleware, listAssets)
router.get('/shared-with-curloginuser', authMiddleware, listSharedAssets)
router.delete('/:id', authMiddleware, deleteAsset)
router.get('/:id/view', authMiddleware, streamAsset)
router.get('/:id/thumbnail', authMiddleware, streamThumbnail)
router.get('/:id/download', authMiddleware, downloadAsset)
router.post('/:id/share', authMiddleware, shareAsset)
router.get('/:id/shares', authMiddleware, listAssetShares)
router.delete('/:id/shares/:shareId', authMiddleware, deleteShare)
router.patch('/:id/shares/:shareId', authMiddleware, updateSharePermission)

export default router
