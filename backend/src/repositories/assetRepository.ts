/*
 ****************************************************************************************************************************
 * Filename    : assetRepository
 * Description : Database operations for assets.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-16
 ****************************************************************************************************************************
 */

import { Op } from 'sequelize'
import { Asset, AssetShare, TeamMember, AuthUser, Team } from '../models'
import type {
  AssetCreateData,
  AssetListQuery,
  AssetProcessingResult,
  AssetStatus,
  ShareScope,
  SharePermission,
} from '../types'

export class AssetRepository {
  async create(data: AssetCreateData): Promise<Asset> {
    return Asset.create(data as unknown as Asset)
  }

  async findById(id: string): Promise<Asset | null> {
    return Asset.findByPk(id)
  }

  async list(query: AssetListQuery, userId: string): Promise<Asset[]> {
    // User only ever see assets they uploaded for themselves.
    return this.findFiltered(query, { uploadedBy: userId })
  }

  // Assets shared directly with this user, or with any team they belong to
  async listSharedWithUser(
    query: AssetListQuery,
    userId: string
  ): Promise<Asset[]> {
    const memberships = await TeamMember.findAll({ where: { userId } })
    const teamIds = memberships.map((m) => m.teamId)

    const shares = await AssetShare.findAll({
      where: {
        [Op.or]: [
          { scope: 'user', sharedWithUserId: userId },
          ...(teamIds.length ? [{ scope: 'team', teamId: teamIds }] : []),
        ],
      },
    })

    const assetIds = [...new Set(shares.map((s) => s.assetId))]
    if (!assetIds.length) return []

    return this.findFiltered(query, { id: assetIds })
  }

  private async findFiltered(
    query: AssetListQuery,
    baseWhere: Record<string, unknown>
  ): Promise<Asset[]> {
    const page = Math.max(1, Number(query.page) || 1)
    const limit = Math.min(100, Number(query.limit) || 20) // Cap page size
    const offset = (page - 1) * limit

    const where: Record<string, unknown> = { ...baseWhere }

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

  // users can only delete assets they uploaded themselves.
  async delete(id: string, userId: string): Promise<Asset | null> {
    const asset = await Asset.findOne({ where: { id, uploadedBy: userId } })

    if (!asset) return null

    await asset.destroy()
    return asset
  }

  // This is for who can have access to the Asset(Uploaded himself or a team member). View access can view or download
  async canAccess(
    asset: Asset,
    userId: string,
    required: SharePermission
  ): Promise<boolean> {
    if (asset.uploadedBy === userId) return true

    const satisfies = (granted: SharePermission) =>
      required === 'view' || granted === 'download'

    const userShare = await AssetShare.findOne({
      where: { assetId: asset.id, scope: 'user', sharedWithUserId: userId },
    })
    if (userShare && satisfies(userShare.permission)) return true

    const memberships = await TeamMember.findAll({ where: { userId } })
    const teamIds = memberships.map((m) => m.teamId)
    if (!teamIds.length) return false

    const teamShare = await AssetShare.findOne({
      where: { assetId: asset.id, scope: 'team', teamId: teamIds },
    })
    return !!teamShare && satisfies(teamShare.permission)
  }

  async findShareByTarget(
    assetId: string,
    scope: ShareScope,
    targetId: string
  ): Promise<AssetShare | null> {
    return AssetShare.findOne({
      where:
        scope === 'team'
          ? { assetId, scope, teamId: targetId }
          : { assetId, scope, sharedWithUserId: targetId },
    })
  }

  async createShare(data: {
    assetId: string
    scope: ShareScope
    teamId: string | null
    sharedWithUserId: string | null
    permission: SharePermission
    createdBy: string
  }): Promise<AssetShare> {
    return AssetShare.create(data)
  }

  // Shares for an asset, with the team name or shared user's email for display in the UI.
  async listShares(assetId: string): Promise<AssetShare[]> {
    return AssetShare.findAll({
      where: { assetId },
      include: [
        { model: Team, as: 'team', attributes: ['id', 'name'] },
        { model: AuthUser, as: 'sharedWithUser', attributes: ['id', 'email'] },
      ],
      order: [['createdAt', 'DESC']],
    })
  }

  async findShareById(
    assetId: string,
    shareId: string
  ): Promise<AssetShare | null> {
    return AssetShare.findOne({ where: { id: shareId, assetId } })
  }

  async deleteShare(assetId: string, shareId: string): Promise<boolean> {
    const deleted = await AssetShare.destroy({
      where: { id: shareId, assetId },
    })
    return deleted > 0
  }

  async updateSharePermission(
    assetId: string,
    shareId: string,
    permission: SharePermission
  ): Promise<AssetShare | null> {
    const share = await AssetShare.findOne({ where: { id: shareId, assetId } })
    if (!share) return null

    share.permission = permission
    await share.save()
    return share
  }
}

// Shared repository instance.
export const assetRepository = new AssetRepository()
