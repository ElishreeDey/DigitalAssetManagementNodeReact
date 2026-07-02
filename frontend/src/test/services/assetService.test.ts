/*
 ****************************************************************************************************************************
 * Filename    : assetService.test
 * Description : Unit tests for the asset service — upload, list, listShared, remove, shareWithTeam.
 *               The shared Axios instance is mocked so no real HTTP calls are made.
 * Author      : Elishree Dey Chand
 * Created     : 2026-07-01
 ****************************************************************************************************************************
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}))

import { assetService } from '../../services/assetService'
import api from '../../services/api'

const mockApi = vi.mocked(api)

describe('assetService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('list', () => {
    it('calls GET /assets and returns the asset array', async () => {
      const assets = [{ id: 'a1', originalName: 'photo.jpg' }]
      mockApi.get.mockResolvedValue({ data: { assets } })
      const result = await assetService.list()
      expect(mockApi.get).toHaveBeenCalledWith('/assets', { params: undefined })
      expect(result).toEqual(assets)
    })

    it('forwards search, type, and sort query params', async () => {
      mockApi.get.mockResolvedValue({ data: { assets: [] } })
      await assetService.list({ search: 'cat', type: 'image', sort: 'asc' })
      expect(mockApi.get).toHaveBeenCalledWith('/assets', {
        params: { search: 'cat', type: 'image', sort: 'asc' },
      })
    })
  })

  describe('listShared', () => {
    it('calls GET /assets/shared-with-curloginuser and returns the asset array', async () => {
      const assets = [{ id: 'a2', originalName: 'shared.pdf' }]
      mockApi.get.mockResolvedValue({ data: { assets } })
      const result = await assetService.listShared()
      expect(mockApi.get).toHaveBeenCalledWith(
        '/assets/shared-with-curloginuser',
        { params: undefined }
      )
      expect(result).toEqual(assets)
    })
  })

  describe('remove', () => {
    it('calls DELETE /assets/:id', async () => {
      mockApi.delete.mockResolvedValue({})
      await assetService.remove('a1')
      expect(mockApi.delete).toHaveBeenCalledWith('/assets/a1')
    })
  })

  describe('shareWithTeam', () => {
    it('calls POST /assets/:id/share with teamId and permission', async () => {
      mockApi.post.mockResolvedValue({})
      await assetService.shareWithTeam('a1', 't1', 'download')
      expect(mockApi.post).toHaveBeenCalledWith('/assets/a1/share', {
        teamId: 't1',
        permission: 'download',
      })
    })

    it('defaults permission to download when not provided', async () => {
      mockApi.post.mockResolvedValue({})
      await assetService.shareWithTeam('a1', 't1')
      expect(mockApi.post).toHaveBeenCalledWith('/assets/a1/share', {
        teamId: 't1',
        permission: 'download',
      })
    })
  })

  describe('upload', () => {
    it('calls POST /assets/upload with a FormData body containing the files', async () => {
      const assets = [{ id: 'a3', originalName: 'vid.mp4' }]
      mockApi.post.mockResolvedValue({ data: { assets } })

      const file = new File(['content'], 'vid.mp4', { type: 'video/mp4' })
      const result = await assetService.upload([file])

      // Confirm the endpoint and that a FormData was passed (not a plain object).
      expect(mockApi.post).toHaveBeenCalledWith(
        '/assets/upload',
        expect.any(FormData),
        expect.any(Object)
      )
      expect(result).toEqual(assets)
    })
  })
})
