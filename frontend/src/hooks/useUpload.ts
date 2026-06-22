/*
 ****************************************************************************************************************************
 * Filename    : useUpload
 * Description : Manages asset file selection, validation, preview generation, and upload operations.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-17
 ****************************************************************************************************************************
 */

import { useState, useCallback } from 'react'
import { assetService } from '../services'
import type { AssetItem, UploadFileState } from '../types'

const MAX_SIZE_BYTES = 50 * 1024 * 1024 // 50 MB
const ACCEPTED_MIME = /^(image|video)\//

function validateFile(file: File): string | null {
  if (!ACCEPTED_MIME.test(file.type))
    return 'Only images and videos are accepted'

  if (file.size > MAX_SIZE_BYTES) return 'File exceeds the 50 MB limit'

  return null
}

export function useUpload(onSuccess: (assets: AssetItem[]) => void) {
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

      // Release preview URLs after successful upload
      files.forEach((f) => {
        if (f.preview) URL.revokeObjectURL(f.preview)
      })

      setFiles([])
      onSuccess(uploaded)
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Upload failed. Please try again.'

      setUploadError(msg)

      // Reset progress so files can be retried
      setFiles((prev) => prev.map((f) => (f.error ? f : { ...f, progress: 0 })))
    } finally {
      setIsUploading(false)
    }
  }, [files, onSuccess])

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
