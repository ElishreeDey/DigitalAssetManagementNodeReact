/*
 ****************************************************************************************************************************
 * Filename    : assetController
 * Description : Express request handlers for asset upload, listing, streaming, download, and deletion.
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

// Exported as middleware so routes can chain authentication and file upload handling.
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

    // Upload succeeds even if queue publishing fails because the asset is already
    // stored in MinIO and persisted in the database.
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

// Public endpoint to allow browser <img> and <video> tags to load assets directly.
export const streamAsset = async (
  req: Request<IdParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const asset = await assetRepository.findById(req.params.id)

    if (!asset) {
      return res.status(404).json({ message: MESSAGES.ASSET_NOT_FOUND_MSG })
    }

    const stream = await streamFromMinio(asset.bucketPath)

    res.setHeader('Content-Type', asset.mimeType)
    res.setHeader('Content-Length', asset.size)
    res.setHeader('Cache-Control', 'private, max-age=3600')

    // Required for serving assets across different frontend origins.
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')

    stream.pipe(res)
  } catch (error) {
    ;(error as Error).message = MESSAGES.ASSET_STREAM_FAILED_MSG
    next(error)
  }
}

// Falls back to the original asset when thumbnail generation is pending or failed.
export const streamThumbnail = async (
  req: Request<IdParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const asset = await assetRepository.findById(req.params.id)

    if (!asset) {
      return res.status(404).json({ message: MESSAGES.ASSET_NOT_FOUND_MSG })
    }

    const path = asset.thumbnailPath ?? asset.bucketPath
    const mimeType = asset.thumbnailPath ? 'image/jpeg' : asset.mimeType

    const stream = await streamFromMinio(path)

    res.setHeader('Content-Type', mimeType)
    res.setHeader('Cache-Control', 'private, max-age=3600')
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')

    stream.pipe(res)
  } catch (error) {
    ;(error as Error).message = MESSAGES.ASSET_STREAM_FAILED_MSG
    next(error)
  }
}

// Downloads the original asset and increments its download count.
export const downloadAsset = async (
  req: Request<IdParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const asset = await assetRepository.findById(req.params.id)

    if (!asset) {
      return res.status(404).json({ message: MESSAGES.ASSET_NOT_FOUND_MSG })
    }

    await assetRepository.incrementDownloadCount(asset.id)

    const stream = await streamFromMinio(asset.bucketPath)

    res.setHeader('Content-Type', asset.mimeType)
    res.setHeader('Content-Length', asset.size)
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(asset.originalName)}"`
    )
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')

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

    if (!asset) {
      return res.status(404).json({ message: MESSAGES.ASSET_NOT_FOUND_MSG })
    }

    await deleteFromMinio(asset.bucketPath).catch(() => null)

    if (asset.thumbnailPath) {
      await deleteFromMinio(asset.thumbnailPath).catch(() => null)
    }

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
