/*
 ****************************************************************************************************************************
 * Filename    : assets
 * Description : Endpoint paths and streaming URL builders for the asset upload feature.
 *               Streaming URLs (thumbnail/view/download) are built directly from the API base URL because
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-17
 ****************************************************************************************************************************
 */

export const ASSET_ENDPOINTS = {
  UPLOAD: '/assets/upload',
  LIST: '/assets',
} as const

const BASE = (import.meta.env.VITE_API_BASE_URL as string) ?? ''

export const assetUrl = {
  thumbnail: (id: string) => `${BASE}/assets/${id}/thumbnail`,
  view: (id: string) => `${BASE}/assets/${id}/view`,
  download: (id: string) => `${BASE}/assets/${id}/download`,
}
