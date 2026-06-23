/*
 ****************************************************************************************************************************
 * Filename    : assetRepository
 * Description : Database operations for assets.
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
  async create(data: AssetCreateData): Promise<Asset> {
    return Asset.create(data as unknown as Asset)
  }

  async findById(id: string): Promise<Asset | null> {
    return Asset.findByPk(id)
  }

  async list(query: AssetListQuery, userId: string): Promise<Asset[]> {
    const page = Math.max(1, Number(query.page) || 1)
    const limit = Math.min(100, Number(query.limit) || 20) // Cap page size
    const offset = (page - 1) * limit

    // Filter by uploader so users only ever see assets they uploaded themselves.
    const where: Record<string, unknown> = { uploadedBy: userId }

    if (query.search) {
      where['originalName'] = { [Op.iLike]: `%${query.search}%` }
    }

    if (query.type === 'document') {
      where['mimeType'] = 'application/pdf'
    } else if (query.type && query.type !== 'all') {
      where['mimeType'] = { [Op.iLike]: `${query.type}/%` }
    }

    const sortOrder = query.sort === 'asc' ? 'ASC' : 'DESC'

    return Asset.findAll({
      where,
      order: [['createdAt', sortOrder]],
      limit,
      offset,
    })
  }

  async updateStatus(id: string, status: AssetStatus): Promise<void> {
    await Asset.update({ status }, { where: { id } })
  }

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

  async incrementDownloadCount(id: string): Promise<void> {
    await Asset.increment('downloadCount', { where: { id } })
  }

  // Return the asset so callers can clean up related files after deletion.
  // Scoped to uploadedBy so users can only delete assets they uploaded themselves.
  async delete(id: string, userId: string): Promise<Asset | null> {
    const asset = await Asset.findOne({ where: { id, uploadedBy: userId } })

    if (!asset) return null

    await asset.destroy()
    return asset
  }
}

// Shared repository instance.
export const assetRepository = new AssetRepository()
