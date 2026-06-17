/*
 ****************************************************************************************************************************
 * Filename    : assetController
 * Description : Express request handlers for the asset upload feature — upload, list, stream, download, delete.
 *               View/thumbnail/download are intentionally public (no authMiddleware): asset IDs are UUIDs,
 *               so they are unguessable, which lets <img src> and <video src> tags load them cross-origin
 *               without sending cookies. Upload/list/delete remain authenticated.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-17
 ****************************************************************************************************************************
 */

import { Request, Response, NextFunction } from 'express'
import multer from 'multer'
import { assetRepository } from '../repositories'
import { getRabbitChannel, ASSET_QUEUE } from '../config'
import {
  generateStoredName,
  uploadToMinio,
  deleteFromMinio,
  generateTags,
  streamFromMinio,
} from '../services'
import { MESSAGES } from '../constants'
import {
  UPLOAD_MAX_FILE_SIZE_BYTES,
  UPLOAD_MAX_FILES,
  UPLOAD_ACCEPTED_MIME_REGEX,
} from '../constants'
import type { AssetJobData, AssetListQuery } from '../types'

type IdParams = { id: string }

const multerUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: UPLOAD_MAX_FILE_SIZE_BYTES, files: UPLOAD_MAX_FILES },
  fileFilter: (_req, file, cb) => {
    if (UPLOAD_ACCEPTED_MIME_REGEX.test(file.mimetype)) cb(null, true)
    else cb(new Error(MESSAGES.ASSET_INVALID_TYPE_MSG))
  },
})

// Exported as middleware so the router can chain: authMiddleware → uploadMiddleware → uploadAssets
export const uploadMiddleware = multerUpload.array('files', UPLOAD_MAX_FILES)

export const uploadAssets = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const files = req.files as Express.Multer.File[]
    if (!files?.length) {
      return res.status(400).json({ message: MESSAGES.ASSET_NO_FILES_MSG })
    }

    // Publishing failures must not fail the upload — the file is already safely in
    // MinIO and the DB; a lost queue message just means processing waits until the
    // next manual retry, instead of the upload itself failing for the user.
    const channel = await getRabbitChannel().catch(() => null)

    const assets = await Promise.all(
      files.map(async (file) => {
        const storedName = generateStoredName(file.originalname)
        const tags = generateTags(file.originalname, file.mimetype, file.size)
        const bucketPath = await uploadToMinio(
          file.buffer,
          storedName,
          file.mimetype
        )

        const asset = await assetRepository.create({
          originalName: file.originalname,
          storedName,
          mimeType: file.mimetype,
          size: file.size,
          bucketPath,
          tags,
          uploadedBy: req.user!.userId,
        })

        const jobData: AssetJobData = {
          assetId: asset.id,
          bucketPath,
          mimeType: file.mimetype,
          originalName: file.originalname,
          size: file.size,
        }
        channel?.sendToQueue(
          ASSET_QUEUE,
          Buffer.from(JSON.stringify(jobData)),
          {
            persistent: true,
          }
        )

        return asset
      })
    )

    res.status(201).json({ assets })
  } catch (error) {
    ;(error as Error).message = MESSAGES.ASSET_UPLOAD_FAILED_MSG
    next(error)
  }
}

export const listAssets = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = req.query as AssetListQuery
    const assets = await assetRepository.list(query)
    res.status(200).json({ assets })
  } catch (error) {
    ;(error as Error).message = MESSAGES.ASSET_LIST_FAILED_MSG
    next(error)
  }
}

// Streams the original file — no auth guard so <img src> and <video src> work in the browser
export const streamAsset = async (
  req: Request<IdParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const asset = await assetRepository.findById(req.params.id)
    if (!asset)
      return res.status(404).json({ message: MESSAGES.ASSET_NOT_FOUND_MSG })

    const stream = await streamFromMinio(asset.bucketPath)
    res.setHeader('Content-Type', asset.mimeType)
    res.setHeader('Content-Length', asset.size)
    res.setHeader('Cache-Control', 'private, max-age=3600')
    stream.pipe(res)
  } catch (error) {
    ;(error as Error).message = MESSAGES.ASSET_STREAM_FAILED_MSG
    next(error)
  }
}

// Streams the 400×400 thumbnail; falls back to the original for pending/failed assets
export const streamThumbnail = async (
  req: Request<IdParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const asset = await assetRepository.findById(req.params.id)
    if (!asset)
      return res.status(404).json({ message: MESSAGES.ASSET_NOT_FOUND_MSG })

    const path = asset.thumbnailPath ?? asset.bucketPath
    const mimeType = asset.thumbnailPath ? 'image/jpeg' : asset.mimeType

    const stream = await streamFromMinio(path)
    res.setHeader('Content-Type', mimeType)
    res.setHeader('Cache-Control', 'private, max-age=3600')
    stream.pipe(res)
  } catch (error) {
    ;(error as Error).message = MESSAGES.ASSET_STREAM_FAILED_MSG
    next(error)
  }
}

// Same as streamAsset but adds Content-Disposition: attachment and tracks download counts
export const downloadAsset = async (
  req: Request<IdParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const asset = await assetRepository.findById(req.params.id)
    if (!asset)
      return res.status(404).json({ message: MESSAGES.ASSET_NOT_FOUND_MSG })

    await assetRepository.incrementDownloadCount(asset.id)

    const stream = await streamFromMinio(asset.bucketPath)
    res.setHeader('Content-Type', asset.mimeType)
    res.setHeader('Content-Length', asset.size)
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(asset.originalName)}"`
    )
    stream.pipe(res)
  } catch (error) {
    ;(error as Error).message = MESSAGES.ASSET_STREAM_FAILED_MSG
    next(error)
  }
}

export const deleteAsset = async (
  req: Request<IdParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const asset = await assetRepository.delete(req.params.id)
    if (!asset)
      return res.status(404).json({ message: MESSAGES.ASSET_NOT_FOUND_MSG })

    await deleteFromMinio(asset.bucketPath).catch(() => null)
    if (asset.thumbnailPath)
      await deleteFromMinio(asset.thumbnailPath).catch(() => null)
    await Promise.all(
      asset.renditions.map((r) =>
        deleteFromMinio(r.bucketPath).catch(() => null)
      )
    )

    res.status(200).json({ message: MESSAGES.ASSET_DELETE_SUCCESS_MSG })
  } catch (error) {
    ;(error as Error).message = MESSAGES.ASSET_DELETE_FAILED_MSG
    next(error)
  }
}
