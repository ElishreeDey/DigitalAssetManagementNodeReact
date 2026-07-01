/*
 ****************************************************************************************************************************
 * Filename    : assetController.test
 * Description : Unit tests for asset listing and deletion endpoints.
 *               config, repositories, and services are all mocked to prevent
 *               real Sequelize, MinIO, and RabbitMQ connections during the test run.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-30
 ****************************************************************************************************************************
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// vi.hoisted ensures these mock functions are available inside the vi.mock
const {
  mockList,
  mockListSharedWithUser,
  mockFindById,
  mockDelete,
  mockDeleteFromMinio,
} = vi.hoisted(() => ({
  mockList: vi.fn(),
  mockListSharedWithUser: vi.fn(),
  mockFindById: vi.fn(),
  mockDelete: vi.fn(),
  mockDeleteFromMinio: vi.fn(),
}))

// Prevent Sequelize, MinIO, and RabbitMQ from attempting real connections
// when assetController.ts imports from the config barrel at module load time.
vi.mock('../../config', () => ({
  default: { sync: vi.fn(), close: vi.fn() },
  keys: {
    clientUrl: 'http://localhost:5173',
    port: 3000,
    jwtSecret: 'test-secret',
    rateLimitMax: 100,
    db: {
      host: 'localhost',
      port: 5432,
      user: 'test',
      password: 'test',
      name: 'test_db',
    },
    minio: {
      endPoint: 'localhost',
      port: 9000,
      accessKey: 'test',
      secretKey: 'test',
      useSSL: false,
    },
    rabbitmq: { url: 'amqp://localhost:5672' },
  },
  minioClient: {},
  BUCKET_NAME: 'test-bucket',
  ensureBucket: vi.fn(),
  getRabbitChannel: vi.fn().mockResolvedValue(null),
  ASSET_QUEUE: 'asset-processing',
}))

// Mock the entire repositories barrel so no Sequelize models are imported.
vi.mock('../../repositories', () => ({
  assetRepository: {
    list: mockList,
    listSharedWithUser: mockListSharedWithUser,
    findById: mockFindById,
    delete: mockDelete,
    create: vi.fn(),
    updateStatus: vi.fn(),
    updateAfterProcessing: vi.fn(),
    incrementDownloadCount: vi.fn(),
    canAccess: vi.fn(),
    createShare: vi.fn(),
    findShareByTeam: vi.fn(),
    listShares: vi.fn(),
    findShareById: vi.fn(),
    deleteShare: vi.fn(),
    updateSharePermission: vi.fn(),
  },
  teamRepository: {
    findById: vi.fn(),
    isMember: vi.fn(),
  },
}))

// Mock the services barrel to prevent MinIO upload/download calls.
vi.mock('../../services', () => ({
  generateStoredName: vi.fn().mockReturnValue('stored-name.jpg'),
  uploadToMinio: vi.fn().mockResolvedValue(undefined),
  deleteFromMinio: mockDeleteFromMinio,
  generateTags: vi.fn().mockReturnValue([]),
  streamFromMinio: vi.fn(),
  authService: { hashPassword: vi.fn(), verifyPassword: vi.fn() },
}))

import {
  listAssets,
  listSharedAssets,
  deleteAsset,
} from '../../controllers/assetController'
import { MESSAGES } from '../../constants'

describe('assetController', () => {
  const mockNext = vi.fn()
  // Shared user fixture — represents the currently authenticated user on every request.
  const mockUser = { userId: 'user-123', email: 'test@example.com' }

  // Builds a chainable mock response (res.status(x).json(y) pattern).
  function makeRes() {
    const res = {
      status: vi.fn(),
      json: vi.fn(),
      setHeader: vi.fn(),
      pipe: vi.fn(),
    }
    res.status.mockReturnValue(res)
    res.json.mockReturnValue(res)
    return res as any
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // listAssets
  describe('listAssets', () => {
    it('returns personal assets for the logged-in user', async () => {
      const assets = [{ id: 'a1', originalName: 'photo.jpg', size: 1024 }]
      mockList.mockResolvedValue(assets)

      const req = { query: { sort: 'desc' }, user: mockUser } as any
      const res = makeRes()
      await listAssets(req, res, mockNext)

      // Confirm the repository receives both the query filters and the caller's userId.
      expect(mockList).toHaveBeenCalledWith({ sort: 'desc' }, mockUser.userId)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({ assets })
    })

    it('passes search and type query params to the repository', async () => {
      mockList.mockResolvedValue([])
      const req = {
        query: { search: 'cat', type: 'image', sort: 'asc' },
        user: mockUser,
      } as any
      const res = makeRes()
      await listAssets(req, res, mockNext)
      expect(mockList).toHaveBeenCalledWith(
        { search: 'cat', type: 'image', sort: 'asc' },
        mockUser.userId
      )
    })

    it('calls next when the repository throws', async () => {
      mockList.mockRejectedValue(new Error('DB error'))
      const req = { query: {}, user: mockUser } as any
      const res = makeRes()
      await listAssets(req, res, mockNext)
      expect(mockNext).toHaveBeenCalledOnce()
    })
  })

  //listSharedAssets
  describe('listSharedAssets', () => {
    it('returns team assets visible to the logged-in user', async () => {
      const assets = [
        { id: 'a2', originalName: 'shared.pdf', teamName: 'Design' },
      ]
      mockListSharedWithUser.mockResolvedValue(assets)

      const req = { query: {}, user: mockUser } as any
      const res = makeRes()
      await listSharedAssets(req, res, mockNext)

      expect(mockListSharedWithUser).toHaveBeenCalledWith({}, mockUser.userId)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({ assets })
    })

    it('returns an empty array when the user belongs to no teams', async () => {
      // The repository returns [] when the user has no team memberships.
      mockListSharedWithUser.mockResolvedValue([])
      const req = { query: {}, user: mockUser } as any
      const res = makeRes()
      await listSharedAssets(req, res, mockNext)
      expect(res.json).toHaveBeenCalledWith({ assets: [] })
    })

    it('calls next when the repository throws', async () => {
      mockListSharedWithUser.mockRejectedValue(new Error('DB error'))
      const req = { query: {}, user: mockUser } as any
      const res = makeRes()
      await listSharedAssets(req, res, mockNext)
      expect(mockNext).toHaveBeenCalledOnce()
    })
  })

  // deleteAsset
  describe('deleteAsset', () => {
    it('returns 404 when the asset does not exist or belongs to another user', async () => {
      // assetRepository.delete queries with { id, uploadedBy: userId },
      // so it returns null both when the asset is missing AND when the userId does not match.
      mockDelete.mockResolvedValue(null)
      const req = { params: { id: 'missing-id' }, user: mockUser } as any
      const res = makeRes()
      await deleteAsset(req, res, mockNext)
      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({
        message: MESSAGES.ASSET_NOT_FOUND_MSG,
      })
    })

    it('deletes the MinIO object and returns 200 on success', async () => {
      const asset = {
        id: 'a1',
        uploadedBy: mockUser.userId,
        bucketPath: 'uploads/stored-name.jpg',
        thumbnailPath: null,
        renditions: [],
      }
      mockDelete.mockResolvedValue(asset)
      mockDeleteFromMinio.mockResolvedValue(undefined)

      const req = { params: { id: 'a1' }, user: mockUser } as any
      const res = makeRes()
      await deleteAsset(req, res, mockNext)

      expect(mockDelete).toHaveBeenCalledWith('a1', mockUser.userId)
      expect(mockDeleteFromMinio).toHaveBeenCalledWith(asset.bucketPath)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: MESSAGES.ASSET_DELETE_SUCCESS_MSG,
      })
    })

    it('also deletes the thumbnail path when it exists', async () => {
      // Videos and PDFs get a thumbnail stored separately — both paths must be cleaned up.
      const asset = {
        id: 'a2',
        uploadedBy: mockUser.userId,
        bucketPath: 'uploads/video.mp4',
        thumbnailPath: 'thumbnails/video.jpg',
        renditions: [],
      }
      mockDelete.mockResolvedValue(asset)
      mockDeleteFromMinio.mockResolvedValue(undefined)

      const req = { params: { id: 'a2' }, user: mockUser } as any
      const res = makeRes()
      await deleteAsset(req, res, mockNext)

      expect(mockDeleteFromMinio).toHaveBeenCalledWith(asset.bucketPath)
      expect(mockDeleteFromMinio).toHaveBeenCalledWith(asset.thumbnailPath)
    })
  })
})
