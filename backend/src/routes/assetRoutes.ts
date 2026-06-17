/*
 ****************************************************************************************************************************
 * Filename    : assetRoutes
 * Description : Asset upload feature routes. Upload/list/delete require authentication; view/thumbnail/download
 *               are public since asset IDs are unguessable UUIDs (lets <img>/<video> tags load cross-origin).
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

// ── Protected ──────────────────────────────────────────────────────────────
router.post('/upload', authMiddleware, uploadMiddleware, uploadAssets)
router.get('/', authMiddleware, listAssets)
router.delete('/:id', authMiddleware, deleteAsset)

// ── Public (UUID-gated) ────────────────────────────────────────────────────
router.get('/:id/view', streamAsset)
router.get('/:id/thumbnail', streamThumbnail)
router.get('/:id/download', downloadAsset)

export default router
