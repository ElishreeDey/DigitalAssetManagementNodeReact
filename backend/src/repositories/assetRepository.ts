/*
 ****************************************************************************************************************************
 * Filename    : assetRepository
 * Description : All direct database operations for the assets table — no business logic lives here.
 *               Controllers and workers call these methods; raw Sequelize queries stay confined to this file.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-16
 ****************************************************************************************************************************
 */

import { Op } from 'sequelize'
import { Asset } from '../models/assetModel'
import type {
  AssetCreateData,
  AssetListQuery,
  AssetProcessingResult,
  AssetStatus,
} from '../types'

export class AssetRepository {
  // Insert a new asset row immediately after upload — status defaults to 'pending'
  async create(data: AssetCreateData): Promise<Asset> {
    return Asset.create(data as unknown as Asset)
  }

  // Used by the worker and streaming endpoints to fetch a single asset by UUID
  async findById(id: string): Promise<Asset | null> {
    return Asset.findByPk(id)
  }

  // Paginated list with optional search (filename) and type (image/video) filter
  async list(query: AssetListQuery): Promise<Asset[]> {
    const page = Math.max(1, Number(query.page) || 1)
    const limit = Math.min(100, Number(query.limit) || 20) // cap at 100 per page
    const offset = (page - 1) * limit

    // Build the WHERE clause only for filters that were actually provided
    const where: Record<string, unknown> = {}

    if (query.search) {
      where['originalName'] = { [Op.iLike]: `%${query.search}%` }
    }

    if (query.type && query.type !== 'all') {
      // mimeType starts with 'image/' or 'video/' — match the category prefix
      where['mimeType'] = { [Op.iLike]: `${query.type}/%` }
    }

    return Asset.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    })
  }

  // Called by the worker when it picks up a job — marks the asset as in-progress
  async updateStatus(id: string, status: AssetStatus): Promise<void> {
    await Asset.update({ status }, { where: { id } })
  }

  // Called by the worker after thumbnail/transcode completes — writes all processing results at once
  async updateAfterProcessing(
    id: string,
    result: AssetProcessingResult
  ): Promise<void> {
    await Asset.update(
      {
        status: result.status,
        thumbnailPath: result.thumbnailPath,
        width: result.width ?? null,
        height: result.height ?? null,
        renditions: result.renditions ?? [],
      },
      { where: { id } }
    )
  }

  // Increments download counter each time a file is downloaded — used for analytics
  async incrementDownloadCount(id: string): Promise<void> {
    await Asset.increment('downloadCount', { where: { id } })
  }

  // Returns the asset before deleting so the caller can remove the file from MinIO too
  async delete(id: string): Promise<Asset | null> {
    const asset = await Asset.findByPk(id)
    if (!asset) return null
    await asset.destroy()
    return asset
  }
}

// Singleton instance — import this object rather than instantiating the class directly
export const assetRepository = new AssetRepository()
