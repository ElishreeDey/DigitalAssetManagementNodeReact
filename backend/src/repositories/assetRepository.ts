/*
 ****************************************************************************************************************************
 * Filename    : assetRepository
 * Description : Database operations for assets.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-16
 ****************************************************************************************************************************
 */

import { Op } from 'sequelize' //Op means Operators used for where op.like conditions in SQL
import { Asset, AssetShare, TeamMember, Team } from '../models'
import type {
  AssetCreateData,
  AssetListQuery,
  AssetProcessingResult,
  AssetStatus,
  SharePermission,
} from '../types'

export class AssetRepository {
  //Insert a new asset into the database.
  async create(data: AssetCreateData): Promise<Asset> {
    return Asset.create(data as unknown as Asset)
  }

  //Find an asset by its primary key
  async findById(id: string): Promise<Asset | null> {
    return Asset.findByPk(id)
  }

  // User only ever see assets they uploaded for themselves.
  async list(query: AssetListQuery, userId: string): Promise<Asset[]> {
    return this.findFiltered(query, { uploadedBy: userId })
  }

  // Assets shared with any team this user belongs to.
  // For Team assets display team name so the UI can display which team the asset belong to.
  async listSharedWithUser(
    query: AssetListQuery,
    userId: string
  ): Promise<Record<string, unknown>[]> {
    const memberships = await TeamMember.findAll({ where: { userId } })
    const teamIds = memberships.map((m) => m.teamId)
    if (!teamIds.length) return []

    const shares = await AssetShare.findAll({
      where: { teamId: teamIds },
      include: [{ model: Team, as: 'team', attributes: ['id', 'name'] }],
    })
    if (!shares.length) return []

    const assetTeamMap = new Map<string, { teamId: string; teamName: string }>()
    for (const share of shares) {
      if (!assetTeamMap.has(share.assetId)) {
        const team = (
          share as unknown as { team?: { id: string; name: string } }
        ).team
        assetTeamMap.set(share.assetId, {
          teamId: share.teamId,
          teamName: team?.name ?? '',
        })
      }
    }

    const assetIds = [...assetTeamMap.keys()]
    const assets = await this.findFiltered(query, { id: assetIds })

    return assets.map((a) => ({
      ...(a.toJSON() as Record<string, unknown>),
      teamId: assetTeamMap.get(a.id)!.teamId,
      teamName: assetTeamMap.get(a.id)!.teamName,
    }))
  }

  //Apply search, filtering, sorting
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

    const orderField =
      query.sort === 'size-asc' || query.sort === 'size-desc'
        ? 'size'
        : 'createdAt'
    const orderDir =
      query.sort === 'asc' || query.sort === 'size-asc' ? 'ASC' : 'DESC'

    return Asset.findAll({
      where,
      order: [[orderField, orderDir]],
      limit,
      offset,
    })
  }

  // Update the asset's processing status.
  async updateStatus(id: string, status: AssetStatus): Promise<void> {
    await Asset.update({ status }, { where: { id } })
  }

  //Save thumbnail, metadata after background processing
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

  // This is for who can have access to the Asset (uploaded himself or a team member). View access can view or download
  async canAccess(
    asset: Asset,
    userId: string,
    required: SharePermission
  ): Promise<boolean> {
    if (asset.uploadedBy === userId) return true

    const memberships = await TeamMember.findAll({ where: { userId } })
    const teamIds = memberships.map((m) => m.teamId)
    if (!teamIds.length) return false

    const teamShare = await AssetShare.findOne({
      where: { assetId: asset.id, teamId: teamIds },
    })
    if (!teamShare) return false

    return required === 'view' || teamShare.permission === 'download'
  }

  async findShareByTeam(
    assetId: string,
    teamId: string
  ): Promise<AssetShare | null> {
    return AssetShare.findOne({ where: { assetId, teamId } })
  }

  async createShare(data: {
    assetId: string
    teamId: string
    permission: SharePermission
    createdBy: string
  }): Promise<AssetShare> {
    return AssetShare.create(data as unknown as AssetShare)
  }

  // Shares for an asset, with the team name for display in the UI.
  async listShares(assetId: string): Promise<AssetShare[]> {
    return AssetShare.findAll({
      where: { assetId },
      include: [{ model: Team, as: 'team', attributes: ['id', 'name'] }],
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
