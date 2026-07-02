/*
 ****************************************************************************************************************************
 * Filename    : useUpload.test
 * Description : Unit tests for the useUpload hook — file validation (type/size), preview URL
 *               generation, addFiles, removeFile, validCount, upload (with and without teamId),
 *               error handling, and clear. assetService and axios.isAxiosError are mocked.
 * Author      : Elishree Dey Chand
 * Created     : 2026-07-01
 ****************************************************************************************************************************
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { ASSET_ERRORS } from '../../constants'
import type { AssetItem } from '../../types'

vi.mock('../../services', () => ({
  assetService: {
    upload: vi.fn(),
    shareWithTeam: vi.fn(),
  },
}))

// Mock only isAxiosError; we do not need a real axios instance.
vi.mock('axios', () => ({
  default: { isAxiosError: vi.fn() },
}))

import { useUpload } from '../../hooks/useUpload'
import { assetService } from '../../services'
import axios from 'axios'

const mockAssetService = vi.mocked(assetService)
const mockAxios = vi.mocked(axios)

const MAX_SIZE = 50 * 1024 * 1024 // 50 MB

// Helpers — construct minimal File objects with controlled type and size.
function makeFile(name: string, type: string, size = 1024): File {
  const blob = new Blob([new Uint8Array(size)], { type })
  return new File([blob], name, { type })
}

function makeAsset(id: string): AssetItem {
  return {
    id,
    originalName: `${id}.jpg`,
    mimeType: 'image/jpeg',
    size: 1024,
    tags: [],
    status: 'ready',
    width: null,
    height: null,
    renditions: [],
    downloadCount: 0,
    createdAt: '',
  }
}

describe('useUpload', () => {
  const onSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    // jsdom does not implement URL.createObjectURL — stub both methods.
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-preview')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
  })

  // addFiles
  describe('addFiles', () => {
    it('adds a valid image file with a preview URL and no error', () => {
      const { result } = renderHook(() => useUpload(onSuccess))
      act(() => {
        result.current.addFiles([makeFile('photo.jpg', 'image/jpeg')])
      })

      expect(result.current.files).toHaveLength(1)
      expect(result.current.files[0].error).toBeNull()
      expect(result.current.files[0].preview).toBe('blob:mock-preview')
      expect(URL.createObjectURL).toHaveBeenCalledOnce()
    })

    it('adds a valid PDF with no preview URL and no error', () => {
      const { result } = renderHook(() => useUpload(onSuccess))
      act(() => {
        result.current.addFiles([makeFile('report.pdf', 'application/pdf')])
      })

      expect(result.current.files[0].error).toBeNull()
      expect(result.current.files[0].preview).toBeNull()
    })

    it('adds a valid video file with no preview URL and no error', () => {
      const { result } = renderHook(() => useUpload(onSuccess))
      act(() => {
        result.current.addFiles([makeFile('clip.mp4', 'video/mp4')])
      })

      expect(result.current.files[0].error).toBeNull()
      expect(result.current.files[0].preview).toBeNull()
    })

    it('sets ASSET_ERRORS.INVALID_TYPE for unsupported MIME types', () => {
      const { result } = renderHook(() => useUpload(onSuccess))
      act(() => {
        result.current.addFiles([makeFile('data.csv', 'text/csv')])
      })

      expect(result.current.files[0].error).toBe(ASSET_ERRORS.INVALID_TYPE)
    })

    it('sets ASSET_ERRORS.FILE_TOO_LARGE for files exceeding 50 MB', () => {
      const { result } = renderHook(() => useUpload(onSuccess))
      act(() => {
        result.current.addFiles([
          makeFile('big.jpg', 'image/jpeg', MAX_SIZE + 1),
        ])
      })

      expect(result.current.files[0].error).toBe(ASSET_ERRORS.FILE_TOO_LARGE)
    })

    it('appends new files to the existing list', () => {
      const { result } = renderHook(() => useUpload(onSuccess))
      act(() => {
        result.current.addFiles([makeFile('a.jpg', 'image/jpeg')])
      })
      act(() => {
        result.current.addFiles([makeFile('b.pdf', 'application/pdf')])
      })

      expect(result.current.files).toHaveLength(2)
    })
  })

  // removeFile
  describe('removeFile', () => {
    it('removes the file at the given index', () => {
      const { result } = renderHook(() => useUpload(onSuccess))
      act(() => {
        result.current.addFiles([
          makeFile('a.jpg', 'image/jpeg'),
          makeFile('b.pdf', 'application/pdf'),
        ])
      })
      act(() => {
        result.current.removeFile(0)
      })

      expect(result.current.files).toHaveLength(1)
      expect(result.current.files[0].file.name).toBe('b.pdf')
    })

    it('revokes the preview URL when removing an image file', () => {
      const { result } = renderHook(() => useUpload(onSuccess))
      act(() => {
        result.current.addFiles([makeFile('photo.jpg', 'image/jpeg')])
      })
      act(() => {
        result.current.removeFile(0)
      })

      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-preview')
    })
  })

  // validCount
  describe('validCount', () => {
    it('counts only files without validation errors', () => {
      const { result } = renderHook(() => useUpload(onSuccess))
      act(() => {
        result.current.addFiles([
          makeFile('ok.jpg', 'image/jpeg'),
          makeFile('bad.txt', 'text/plain'),
          makeFile('ok.pdf', 'application/pdf'),
        ])
      })

      expect(result.current.validCount).toBe(2)
    })
  })

  // upload
  describe('upload', () => {
    it('does not call assetService.upload when there are no valid files', async () => {
      const { result } = renderHook(() => useUpload(onSuccess))
      act(() => {
        result.current.addFiles([makeFile('bad.txt', 'text/plain')])
      })

      await act(async () => {
        await result.current.upload()
      })

      expect(mockAssetService.upload).not.toHaveBeenCalled()
    })

    it('calls assetService.upload with only valid files and invokes onSuccess', async () => {
      const uploaded = [makeAsset('a1'), makeAsset('a2')]
      mockAssetService.upload.mockResolvedValue(uploaded)

      const { result } = renderHook(() => useUpload(onSuccess))
      act(() => {
        result.current.addFiles([
          makeFile('ok.jpg', 'image/jpeg'),
          makeFile('bad.txt', 'text/plain'), // invalid — must be excluded
        ])
      })

      await act(async () => {
        await result.current.upload()
      })

      // Only the valid file should be passed.
      const [passedFiles] = mockAssetService.upload.mock.calls[0] as [
        File[],
        unknown,
      ]
      expect(passedFiles).toHaveLength(1)
      expect(passedFiles[0].name).toBe('ok.jpg')

      expect(onSuccess).toHaveBeenCalledWith(uploaded)
      expect(result.current.files).toHaveLength(0) // cleared after success
      expect(result.current.isUploading).toBe(false)
    })

    it('shares each uploaded asset with the team when teamId is provided', async () => {
      const uploaded = [makeAsset('a1'), makeAsset('a2')]
      mockAssetService.upload.mockResolvedValue(uploaded)
      mockAssetService.shareWithTeam.mockResolvedValue(undefined)

      const { result } = renderHook(() => useUpload(onSuccess, 't1'))
      act(() => {
        result.current.addFiles([makeFile('ok.jpg', 'image/jpeg')])
      })

      await act(async () => {
        await result.current.upload()
      })

      expect(mockAssetService.shareWithTeam).toHaveBeenCalledTimes(2)
      expect(mockAssetService.shareWithTeam).toHaveBeenCalledWith('a1', 't1')
      expect(mockAssetService.shareWithTeam).toHaveBeenCalledWith('a2', 't1')
      expect(onSuccess).toHaveBeenCalledWith(uploaded)
    })

    it('sets ASSET_ERRORS.SHARE_FAILED and does not call onSuccess when share fails', async () => {
      mockAssetService.upload.mockResolvedValue([makeAsset('a1')])
      mockAssetService.shareWithTeam.mockRejectedValue(new Error('share error'))

      const { result } = renderHook(() => useUpload(onSuccess, 't1'))
      act(() => {
        result.current.addFiles([makeFile('ok.jpg', 'image/jpeg')])
      })

      await act(async () => {
        await result.current.upload()
      })

      expect(result.current.uploadError).toBe(ASSET_ERRORS.SHARE_FAILED)
      expect(onSuccess).not.toHaveBeenCalled()
    })

    it('sets the axios error message when upload fails with an axios error', async () => {
      const axiosErr = {
        response: { data: { message: 'File type not allowed' } },
      }
      mockAssetService.upload.mockRejectedValue(axiosErr)
      mockAxios.isAxiosError.mockReturnValue(true)

      const { result } = renderHook(() => useUpload(onSuccess))
      act(() => {
        result.current.addFiles([makeFile('ok.jpg', 'image/jpeg')])
      })

      await act(async () => {
        await result.current.upload()
      })

      expect(result.current.uploadError).toBe('File type not allowed')
      expect(result.current.isUploading).toBe(false)
    })

    it('sets a plain Error message when upload fails with a non-axios Error', async () => {
      mockAssetService.upload.mockRejectedValue(new Error('Network error'))
      mockAxios.isAxiosError.mockReturnValue(false)

      const { result } = renderHook(() => useUpload(onSuccess))
      act(() => {
        result.current.addFiles([makeFile('ok.jpg', 'image/jpeg')])
      })

      await act(async () => {
        await result.current.upload()
      })

      expect(result.current.uploadError).toBe('Network error')
    })

    it('falls back to ASSET_ERRORS.UPLOAD_FAILED for unknown rejection values', async () => {
      mockAssetService.upload.mockRejectedValue('unknown')
      mockAxios.isAxiosError.mockReturnValue(false)

      const { result } = renderHook(() => useUpload(onSuccess))
      act(() => {
        result.current.addFiles([makeFile('ok.jpg', 'image/jpeg')])
      })

      await act(async () => {
        await result.current.upload()
      })

      expect(result.current.uploadError).toBe(ASSET_ERRORS.UPLOAD_FAILED)
    })
  })

  // clear
  describe('clear', () => {
    it('empties the file list and revokes all preview URLs', () => {
      const { result } = renderHook(() => useUpload(onSuccess))
      act(() => {
        result.current.addFiles([makeFile('photo.jpg', 'image/jpeg')])
      })
      expect(result.current.files).toHaveLength(1)

      act(() => {
        result.current.clear()
      })

      expect(result.current.files).toHaveLength(0)
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-preview')
    })
  })
})
