/*
 ****************************************************************************************************************************
 * Filename    : useAssets
 * Description : Asset gallery data hook.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-17
 ****************************************************************************************************************************
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { assetService } from '../services'
import { ASSET_ERRORS } from '../constants'
import type { AssetItem } from '../types'

const POLL_INTERVAL_MS = 5000 // In every 5 seconds React checks if need to reload assets.

export function useAssets(
  search: string,
  typeFilter: string,
  sortOrder: 'asc' | 'desc' = 'desc'
) {
  const [assets, setAssets] = useState<AssetItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const hasPendingRef = useRef(false)

  //useCallback React hook - React remembers the same function(fetchAssets) until one of its dependencies(searchTxt, typeFilter, sortOrder)changes.
  const fetchAssets = useCallback(async () => {
    try {
      const data = await assetService.list({
        search: search || undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        sort: sortOrder,
      })

      setAssets(data)

      hasPendingRef.current = data.some(
        (a) => a.status === 'pending' || a.status === 'processing'
      )

      setError(null)
    } catch {
      setError(ASSET_ERRORS.LIST_LOAD_FAILED)
    } finally {
      setIsLoading(false)
    }
  }, [search, typeFilter, sortOrder])

  // useEffect React hook - runs when page opens Or when fetchAssets(search specific condition given)
  useEffect(() => {
    setIsLoading(true)
    void fetchAssets()
  }, [fetchAssets])

  //setInterval in 5sec checks if anything pending if yes then call "fetchAssets"
  useEffect(() => {
    const interval = setInterval(() => {
      if (hasPendingRef.current) void fetchAssets()
    }, POLL_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [fetchAssets])

  //Add asset the new one will be first with exesting prv uplods
  function addAssets(uploaded: AssetItem[]) {
    setAssets((prev) => [...uploaded, ...prev])

    // Ensure polling starts immediately for newly uploaded pending assets.
    if (
      uploaded.some((a) => a.status === 'pending' || a.status === 'processing')
    ) {
      hasPendingRef.current = true
    }
  }

  //Remove Asset from backend first then from frontend screen without refreshing the page.
  async function removeAsset(id: string) {
    await assetService.remove(id)
    setAssets((prev) => prev.filter((a) => a.id !== id))
  }

  // the main function return these values.
  return {
    assets,
    isLoading,
    error,
    addAssets,
    removeAsset,
    refresh: fetchAssets,
  }
}
