/*
 ****************************************************************************************************************************
 * Filename    : asset
 * Description : TypeScript types for the asset upload feature — gallery items, upload queue state, and
 *               the shape returned by the backend's asset endpoints.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-17
 ****************************************************************************************************************************
 */

export type AssetStatus = 'pending' | 'processing' | 'ready' | 'failed'

export type VideoRendition = {
  label: string
  bucketPath: string
}

export type AssetItem = {
  id: string
  originalName: string
  mimeType: string
  size: number
  tags: string[]
  status: AssetStatus
  width: number | null
  height: number | null
  renditions: VideoRendition[]
  downloadCount: number
  createdAt: string
}

// One row in the upload queue shown by UploadZone before/during upload
export type UploadFileState = {
  file: File
  progress: number
  error: string | null
  preview: string | null // object URL, image files only
}
