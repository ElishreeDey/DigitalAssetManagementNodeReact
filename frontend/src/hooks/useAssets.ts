/*
 ****************************************************************************************************************************
 * Filename    : useAssets
 * Description : Fetches and auto-refreshes the asset gallery. Polls every 5s while any asset is still
 *               pending/processing so the gallery picks up worker-completed thumbnails without a manual refresh.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-17
 ****************************************************************************************************************************
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { assetService } from '../services'
import type { AssetItem } from '../types'

const POLL_INTERVAL_MS = 5000

export function useAssets(search: string, typeFilter: string) {
  const [assets, setAssets] = useState<AssetItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const hasPendingRef = useRef(false)

  const fetchAssets = useCallback(async () => {
    try {
      const data = await assetService.list({
        search: search || undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
      })
      setAssets(data)
      hasPendingRef.current = data.some(
        (a) => a.status === 'pending' || a.status === 'processing'
      )
      setError(null)
    } catch {
      setError('Failed to load assets')
    } finally {
      setIsLoading(false)
    }
  }, [search, typeFilter])

  useEffect(() => {
    setIsLoading(true)
    void fetchAssets()
  }, [fetchAssets])

  useEffect(() => {
    const interval = setInterval(() => {
      if (hasPendingRef.current) void fetchAssets()
    }, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [fetchAssets])

  function addAssets(uploaded: AssetItem[]) {
    setAssets((prev) => [...uploaded, ...prev])
    // Newly uploaded assets start as 'pending' — without this, the poll loop has
    // no way to know there's now something to wait on, since it only inspects
    // hasPendingRef, which is otherwise only updated inside fetchAssets().
    if (
      uploaded.some((a) => a.status === 'pending' || a.status === 'processing')
    ) {
      hasPendingRef.current = true
    }
  }

  async function removeAsset(id: string) {
    await assetService.remove(id)
    setAssets((prev) => prev.filter((a) => a.id !== id))
  }

  return {
    assets,
    isLoading,
    error,
    addAssets,
    removeAsset,
    refresh: fetchAssets,
  }
}
