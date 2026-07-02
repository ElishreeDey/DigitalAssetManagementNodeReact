/*
 ****************************************************************************************************************************
 * Filename    : useAssets.test
 * Description : Unit tests for the useAssets hook — initial fetch, source switching (mine/shared),
 *               addAssets, removeAsset, error handling, and the 5-second polling interval.
 *               assetService is mocked; vi.useFakeTimers() controls the polling clock.
 * Author      : Elishree Dey Chand
 * Created     : 2026-07-01
 ****************************************************************************************************************************
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { ASSET_ERRORS } from '../../constants'
import type { AssetItem } from '../../types'

vi.mock('../../services', () => ({
  assetService: {
    list: vi.fn(),
    listShared: vi.fn(),
    remove: vi.fn(),
  },
}))

import { useAssets } from '../../hooks/useAssets'
import { assetService } from '../../services'

const mockAssetService = vi.mocked(assetService)

// Minimal asset factory — only the fields the hook inspects.
function makeAsset(overrides: Partial<AssetItem> = {}): AssetItem {
  return {
    id: 'a1',
    originalName: 'file.jpg',
    mimeType: 'image/jpeg',
    size: 1024,
    status: 'ready',
    uploadedAt: new Date().toISOString(),
    url: '/assets/file.jpg',
    ...overrides,
  } as AssetItem
}

describe('useAssets', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Restore real timers after any test that used fake timers.
    vi.useRealTimers()
  })

  it('fetches assets from assetService.list on mount and sets isLoading to false', async () => {
    const assets = [
      makeAsset({ id: 'a1' }),
      makeAsset({ id: 'a2', originalName: 'doc.pdf' }),
    ]
    mockAssetService.list.mockResolvedValue(assets)

    const { result } = renderHook(() => useAssets('', 'all', 'desc', 'mine'))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.assets).toEqual(assets)
    expect(result.current.error).toBeNull()
    expect(mockAssetService.list).toHaveBeenCalledOnce()
  })

  it('calls assetService.listShared when source is "shared"', async () => {
    const shared = [makeAsset({ id: 'a3', originalName: 'shared.png' })]
    mockAssetService.listShared.mockResolvedValue(shared)

    const { result } = renderHook(() => useAssets('', 'all', 'desc', 'shared'))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.assets).toEqual(shared)
    expect(mockAssetService.listShared).toHaveBeenCalledOnce()
    expect(mockAssetService.list).not.toHaveBeenCalled()
  })

  it('forwards search, type, and sort params to the service', async () => {
    mockAssetService.list.mockResolvedValue([])

    const { result } = renderHook(() =>
      useAssets('cat', 'image', 'asc', 'mine')
    )
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(mockAssetService.list).toHaveBeenCalledWith({
      search: 'cat',
      type: 'image',
      sort: 'asc',
    })
  })

  it('omits search and type params when they are empty / "all"', async () => {
    mockAssetService.list.mockResolvedValue([])

    const { result } = renderHook(() => useAssets('', 'all', 'desc', 'mine'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(mockAssetService.list).toHaveBeenCalledWith({
      search: undefined,
      type: undefined,
      sort: 'desc',
    })
  })

  it('sets ASSET_ERRORS.LIST_LOAD_FAILED when the fetch throws', async () => {
    mockAssetService.list.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useAssets('', 'all', 'desc', 'mine'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe(ASSET_ERRORS.LIST_LOAD_FAILED)
    expect(result.current.assets).toEqual([])
  })

  it('addAssets prepends newly uploaded assets to the list', async () => {
    const initial = [makeAsset({ id: 'a1' })]
    mockAssetService.list.mockResolvedValue(initial)

    const { result } = renderHook(() => useAssets('', 'all', 'desc', 'mine'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const uploaded = [makeAsset({ id: 'a2', originalName: 'new.png' })]
    act(() => {
      result.current.addAssets(uploaded)
    })

    expect(result.current.assets[0]).toEqual(uploaded[0])
    expect(result.current.assets[1]).toEqual(initial[0])
  })

  it('removeAsset calls assetService.remove and removes the asset from state', async () => {
    const assets = [
      makeAsset({ id: 'a1' }),
      makeAsset({ id: 'a2', originalName: 'b.png' }),
    ]
    mockAssetService.list.mockResolvedValue(assets)
    mockAssetService.remove.mockResolvedValue(undefined)

    const { result } = renderHook(() => useAssets('', 'all', 'desc', 'mine'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.removeAsset('a1')
    })

    expect(mockAssetService.remove).toHaveBeenCalledWith('a1')
    expect(result.current.assets).toHaveLength(1)
    expect(result.current.assets[0].id).toBe('a2')
  })

  it('polls fetchAssets every 5 seconds when a pending asset exists', async () => {
    vi.useFakeTimers()

    const pending = [makeAsset({ id: 'a1', status: 'pending' })]
    const ready = [makeAsset({ id: 'a1', status: 'ready' })]

    // First call returns a pending asset; subsequent calls return ready.
    mockAssetService.list
      .mockResolvedValueOnce(pending)
      .mockResolvedValue(ready)

    const { result } = renderHook(() => useAssets('', 'all', 'desc', 'mine'))

    // Flush the initial mount fetch using bounded time advancement (avoids infinite loop).
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(mockAssetService.list).toHaveBeenCalledTimes(1)
    expect(result.current.assets[0].status).toBe('pending')

    // Advance by exactly 5 seconds — the poll fires because hasPendingRef is true.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000)
    })

    expect(mockAssetService.list.mock.calls.length).toBeGreaterThanOrEqual(2)
    expect(result.current.assets[0].status).toBe('ready')
  })

  it('does not poll when there are no pending assets', async () => {
    vi.useFakeTimers()

    mockAssetService.list.mockResolvedValue([makeAsset({ status: 'ready' })])

    renderHook(() => useAssets('', 'all', 'desc', 'mine'))

    // Flush the initial mount fetch.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })
    const callsAfterMount = mockAssetService.list.mock.calls.length

    // Advance past the poll interval — no pending assets means no extra call.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000)
    })

    expect(mockAssetService.list.mock.calls.length).toBe(callsAfterMount)
  })
})
