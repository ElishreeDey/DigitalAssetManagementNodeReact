/*
 ****************************************************************************************************************************
 * Filename    : assetTypes
 * Description : Shared type definitions for asset management.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-16
 ****************************************************************************************************************************
 */

export type AssetStatus = 'pending' | 'processing' | 'ready' | 'failed'

export type AssetJobData = {
  assetId: string
  bucketPath: string
  mimeType: string
  originalName: string
  size: number
}

export type AssetCreateData = {
  originalName: string
  storedName: string
  mimeType: string
  size: number
  bucketPath: string
  tags: string[]
  uploadedBy: string
}

export type VideoRendition = {
  label: string
  bucketPath: string
}

export type AssetProcessingResult = {
  thumbnailPath: string
  width: number | undefined
  height: number | undefined
  status: AssetStatus
  renditions?: VideoRendition[] // Videos only
}

export type AssetListQuery = {
  search?: string
  type?: string
  page?: string
  limit?: string
  sort?: 'asc' | 'desc' | 'size-asc' | 'size-desc' //Sort by creation dt asc or desc or sort by size asc or desc
}
