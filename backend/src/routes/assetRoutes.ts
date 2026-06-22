/*
 ****************************************************************************************************************************
 * Filename    : assetRoutes
 * Description : Asset upload feature routes. Upload/list/delete require authentication; view/thumbnail/download
 *               are public since asset IDs are unguessable UUIDs.
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

// Protected Routes
router.post('/upload', authMiddleware, uploadMiddleware, uploadAssets)
router.get('/', authMiddleware, listAssets)
router.delete('/:id', authMiddleware, deleteAsset)

// Public Routes
router.get('/:id/view', streamAsset)
router.get('/:id/thumbnail', streamThumbnail)
router.get('/:id/download', downloadAsset)

export default router
