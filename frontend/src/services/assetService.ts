/*
 ****************************************************************************************************************************
 * Filename    : assetService
 * Description : API calls for the asset upload feature — upload, list, delete. Streaming endpoints
 *               (thumbnail/view/download) are not called here since they're used as raw <img>/<a> URLs.
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

    // No explicit Content-Type header — axios sets multipart/form-data with the
    // correct boundary automatically. Setting it manually breaks multer's parsing.
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
  }): Promise<AssetItem[]> {
    const res = await api.get<{ assets: AssetItem[] }>(ASSET_ENDPOINTS.LIST, {
      params,
    })
    return res.data.assets
  },

  async remove(id: string): Promise<void> {
    await api.delete(`${ASSET_ENDPOINTS.LIST}/${id}`)
  },
}
