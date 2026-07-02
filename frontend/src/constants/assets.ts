/*
 ****************************************************************************************************************************
 * Filename    : assets
 * Description : Asset API endpoints and URL helpers.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-17
 ****************************************************************************************************************************
 */

export const ASSET_ENDPOINTS = {
  UPLOAD: '/assets/upload',
  LIST: '/assets',
  LIST_SHARED: '/assets/shared-with-curloginuser',
  SHARE: (id: string) => `/assets/${id}/share`,
} as const

export const ASSET_ERRORS = {
  LIST_LOAD_FAILED: 'Failed to load assets',
  INVALID_TYPE: 'Only images, videos, and PDFs are accepted',
  FILE_TOO_LARGE: 'File exceeds the 50 MB limit',
  UPLOAD_FAILED: 'Upload failed. Please try again.',
  SHARE_FAILED:
    'Files uploaded but could not be shared with the team. Find them in My Assets.',
} as const

const BASE = (import.meta.env.VITE_API_BASE_URL as string) ?? ''

export const assetUrl = {
  thumbnail: (id: string) => `${BASE}/assets/${id}/thumbnail`,
  view: (id: string) => `${BASE}/assets/${id}/view`,
  download: (id: string) => `${BASE}/assets/${id}/download`,
}
