/*
 ****************************************************************************************************************************
 * Filename    : assetService
 * Description : API calls for asset management.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-17
 ****************************************************************************************************************************
 */

import api from './api'
import { ASSET_ENDPOINTS } from '../constants'
import type { AssetItem } from '../types'

export const assetService = {
  async upload(
    files: File[],
    onProgress?: (percent: number) => void
  ): Promise<AssetItem[]> {
    const formData = new FormData()
    files.forEach((f) => formData.append('files', f))

    const res = await api.post<{ assets: AssetItem[] }>(
      ASSET_ENDPOINTS.UPLOAD,
      formData,
      {
        onUploadProgress: (e) => {
          if (e.total) onProgress?.(Math.round((e.loaded * 100) / e.total))
        },
      }
    )
    return res.data.assets
  },

  async list(params?: {
    search?: string
    type?: string
    sort?: 'asc' | 'desc'
  }): Promise<AssetItem[]> {
    const res = await api.get<{ assets: AssetItem[] }>(ASSET_ENDPOINTS.LIST, {
      params,
    })
    return res.data.assets
  },

  async remove(id: string): Promise<void> {
    await api.delete(`${ASSET_ENDPOINTS.LIST}/${id}`)
  },

  async shareWithTeam(
    assetId: string,
    teamId: string,
    permission: 'view' | 'download' = 'download'
  ): Promise<void> {
    await api.post(ASSET_ENDPOINTS.SHARE(assetId), { teamId, permission })
  },

  async listShared(params?: {
    search?: string
    type?: string
    sort?: 'asc' | 'desc'
  }): Promise<AssetItem[]> {
    const res = await api.get<{ assets: AssetItem[] }>(
      ASSET_ENDPOINTS.LIST_SHARED,
      { params }
    )
    return res.data.assets
  },
}
