/*
 ****************************************************************************************************************************
 * Filename    : useUpload
 * Description : Manages asset file selection, validation, preview generation, and upload operations.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-17
 ****************************************************************************************************************************
 */

import { useState, useCallback } from 'react'
import axios from 'axios'
import { assetService } from '../services'
import { ASSET_ERRORS } from '../constants'
import type { AssetItem, UploadFileState } from '../types'

const MAX_SIZE_BYTES = 50 * 1024 * 1024 // 50 MB
const ACCEPTED_MIME = /^(image|video)\/|^application\/pdf$/

// validateFile function first check two things file-type is img/video/pdf and max-size with in specified
function validateFile(file: File): string | null {
  if (!ACCEPTED_MIME.test(file.type)) return ASSET_ERRORS.INVALID_TYPE

  if (file.size > MAX_SIZE_BYTES) return ASSET_ERRORS.FILE_TOO_LARGE

  return null
}

// useUpload is custom hook defined here it owns the complete upload lifecycle.
export function useUpload(
  onSuccess: (assets: AssetItem[]) => void,
  teamId?: string
) {
  const [files, setFiles] = useState<UploadFileState[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const next: UploadFileState[] = Array.from(incoming).map((file) => ({
      file,
      progress: 0,
      error: validateFile(file),
      preview: file.type.startsWith('image/')
        ? URL.createObjectURL(file)
        : null,
    }))

    setFiles((prev) => [...prev, ...next])
  }, [])

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => {
      const copy = [...prev]
      const removed = copy.splice(index, 1)[0]

      if (removed.preview) {
        URL.revokeObjectURL(removed.preview)
      }

      return copy
    })
  }, [])

  const upload = useCallback(async () => {
    const valid = files.filter((f) => !f.error)

    if (!valid.length) return

    setIsUploading(true)
    setUploadError(null)

    try {
      const uploaded = await assetService.upload(
        valid.map((f) => f.file),
        (percent) =>
          setFiles((prev) =>
            prev.map((f) => (f.error ? f : { ...f, progress: percent }))
          )
      )

      // Auto-share every uploaded asset with the selected team
      if (teamId) {
        try {
          await Promise.all(
            uploaded.map((asset) =>
              assetService.shareWithTeam(asset.id, teamId)
            )
          )
        } catch {
          setUploadError(ASSET_ERRORS.SHARE_FAILED)
          setFiles((prev) =>
            prev.map((f) => (f.error ? f : { ...f, progress: 0 }))
          )
          return
        }
      }

      // Release preview URLs after successful upload
      files.forEach((f) => {
        if (f.preview) URL.revokeObjectURL(f.preview)
      })

      setFiles([]) // once upload is done upload list becomes empty.
      onSuccess(uploaded)
    } catch (err) {
      const msg =
        axios.isAxiosError(err) &&
        typeof err.response?.data?.message === 'string'
          ? (err.response.data.message as string)
          : err instanceof Error
            ? err.message
            : ASSET_ERRORS.UPLOAD_FAILED

      setUploadError(msg)

      // Reset progress so files can be retried
      setFiles((prev) => prev.map((f) => (f.error ? f : { ...f, progress: 0 })))
    } finally {
      setIsUploading(false)
    }
  }, [files, onSuccess, teamId])

  const clear = useCallback(() => {
    // Clean up generated preview URLs
    files.forEach((f) => {
      if (f.preview) URL.revokeObjectURL(f.preview)
    })

    setFiles([])
  }, [files])

  const validCount = files.filter((f) => !f.error).length

  return {
    files,
    isUploading,
    validCount,
    uploadError,
    addFiles,
    removeFile,
    upload,
    clear,
  }
}
