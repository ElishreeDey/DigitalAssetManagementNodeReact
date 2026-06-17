/*
 ****************************************************************************************************************************
 * Filename    : assetTypes
 * Description : Type definitions for the asset upload feature — shared across model, repository,
 *               controller, and worker so all layers speak the same shape.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-16
 ****************************************************************************************************************************
 */

// Lifecycle states an asset moves through after upload
export type AssetStatus = 'pending' | 'processing' | 'ready' | 'failed'

// Payload published to RabbitMQ by the API and consumed by the Worker
export type AssetJobData = {
  assetId: string
  bucketPath: string
  mimeType: string
  originalName: string
  size: number
}

// Shape required to insert a new asset row immediately after upload
export type AssetCreateData = {
  originalName: string
  storedName: string
  mimeType: string
  size: number
  bucketPath: string
  tags: string[]
  uploadedBy: string
}

// A single transcoded video variant stored in MinIO
export type VideoRendition = {
  label: string // e.g. '1080p', '720p'
  bucketPath: string
}

// Fields the worker writes back once processing (thumbnail / transcoding) completes
export type AssetProcessingResult = {
  thumbnailPath: string
  width: number | undefined
  height: number | undefined
  status: AssetStatus
  renditions?: VideoRendition[] // populated for videos only
}

// Query parameters accepted by the list endpoint
export type AssetListQuery = {
  search?: string // matches originalName
  type?: string // 'image' | 'video'
  page?: string // 1-based page number (string because it comes from req.query)
  limit?: string // items per page
}
