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
  generateStoredName /*generateStoreName e.g: Inut as "bird.jpg" output as "4f83a92d-11.jpg"*/,
  uploadToMinio,
  deleteFromMinio,
  generateTags,
  streamFromMinio /*Returns a readable stream for a stored asset for view/thumbnail/download */,
} from '../services'

import { MESSAGES } from '../constants'

/*This constants are from appConfig file present in constant folder*/
import {
  UPLOAD_MAX_FILE_SIZE_BYTES,
  UPLOAD_MAX_FILES,
  UPLOAD_ACCEPTED_MIME_REGEX,
} from '../constants'

import type { AssetJobData, AssetListQuery } from '../types'

type IdParams = { id: string }

// "MULTER" is used asset file upload without it Express can't read file data.
const multerUpload = multer({
  storage: multer.memoryStorage() /*store file in system's temp folder */,
  limits: { fileSize: UPLOAD_MAX_FILE_SIZE_BYTES, files: UPLOAD_MAX_FILES },
  fileFilter: (_req, file, cb) => {
    if (UPLOAD_ACCEPTED_MIME_REGEX.test(file.mimetype)) cb(null, true)
    else cb(new Error(MESSAGES.ASSET_INVALID_TYPE_MSG))
  },
})

// Exported as middleware for Multer upload handling.
export const uploadMiddleware = multerUpload.array('files', UPLOAD_MAX_FILES)

//UploadAsset get request file img/video/pdf RabbitMq connection create rec in MinIO bucket and DB.
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

    // Open RabbitMq where rabbitmq calls worker and generate thubnail.
    const channel = await getRabbitChannel().catch(() => null)

    //Here files.map uploads multiple files simultaneously.
    //generateStoredName is not actual file name as blue-bird.jpg it will be based on UUID.jpg like
    //generateTags are blue,bird,.jpg etc.
    const assets = await Promise.all(
      files.map(async (file) => {
        const storedName = generateStoredName(file.originalname)
        const tags = generateTags(file.originalname, file.mimetype, file.size)

        // Upload succeeds store in MinIO actual files are stored in S3 like bucket.
        const bucketPath = await uploadToMinio(
          file.buffer,
          storedName,
          file.mimetype
        )

        // Upload succeeds store in the database.
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

// Get list of Assets for current loggedin user only
export const listAssets = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = req.query as AssetListQuery

    // Scope results to the logged-in user so each account only sees its own uploads.
    const assets = await assetRepository.list(query, req.user!.userId)

    res.status(200).json({ assets })
  } catch (error) {
    ;(error as Error).message = MESSAGES.ASSET_LIST_FAILED_MSG
    next(error)
  }
}

// It will open the asset fullsize when you click one of them in asset galary.
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

    const allowed = await assetRepository.canAccess(
      asset,
      req.user!.userId,
      'view'
    )
    if (!allowed) {
      return res.status(403).json({ message: MESSAGES.ASSET_ACCESS_DENIED_MSG })
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

    const allowed = await assetRepository.canAccess(
      asset,
      req.user!.userId,
      'view'
    )
    if (!allowed) {
      return res.status(403).json({ message: MESSAGES.ASSET_ACCESS_DENIED_MSG })
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

// Downloads the original asset and increments download count.
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

    const allowed = await assetRepository.canAccess(
      asset,
      req.user!.userId,
      'download'
    )
    if (!allowed) {
      return res.status(403).json({ message: MESSAGES.ASSET_ACCESS_DENIED_MSG })
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

//Delete Asset feature it will delete from Repository DB and delete from MinIO bucket and thunbnail folder from MinIO
export const deleteAsset = async (
  req: Request<IdParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const asset = await assetRepository.delete(req.params.id, req.user!.userId)

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
