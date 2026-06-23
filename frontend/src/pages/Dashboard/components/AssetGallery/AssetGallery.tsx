/*
 ****************************************************************************************************************************
 * Filename    : AssetGallery
 * Description : Displays uploaded assets with search, filtering, preview, download, and delete actions.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-17
 ****************************************************************************************************************************
 */

import { assetUrl } from '../../../../constants'
import type { AssetItem } from '../../../../types'
import './AssetGallery.css'

type Props = {
  assets: AssetItem[]
  isLoading: boolean
  error: string | null
  onDelete: (id: string) => void
  onPreview: (asset: AssetItem) => void
  search: string
  onSearchChange: (value: string) => void
  typeFilter: string
  onTypeChange: (value: string) => void
  sortOrder: 'asc' | 'desc'
  onSortChange: (value: 'asc' | 'desc') => void
}

const TYPE_TABS = [
  { key: 'all', label: 'All' },
  { key: 'image', label: 'Images' },
  { key: 'video', label: 'Videos' },
  { key: 'document', label: 'Documents' },
]

export default function AssetGallery({
  assets,
  isLoading,
  error,
  onDelete,
  onPreview,
  search,
  onSearchChange,
  typeFilter,
  onTypeChange,
  sortOrder,
  onSortChange,
}: Props) {
  function formatBytes(b: number) {
    if (b < 1024) return `${b} B`
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
    return `${(b / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="gallery-page">
      <div className="gallery-toolbar">
        {/* search by tags or filename */}
        <input
          type="search"
          placeholder="Search by filename…"
          className="gallery-search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />

        {/* filter by all or image or video */}
        <div className="gallery-tabs">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`gallery-tab${typeFilter === tab.key ? ' gallery-tab--active' : ''}`}
              onClick={() => onTypeChange(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* filter by asc or desc upload order */}
        <label className="gallery-sort-label">
          Filter By:
          <select
            className="gallery-sort"
            value={sortOrder}
            onChange={(e) => onSortChange(e.target.value as 'asc' | 'desc')}
            aria-label="Sort by upload date"
          >
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </select>
        </label>
      </div>

      {isLoading && <p className="gallery-status">Loading assets…</p>}
      {error && <p className="gallery-status gallery-status--error">{error}</p>}
      {!isLoading && !error && assets.length === 0 && (
        <p className="gallery-status">
          No assets yet — upload your first file.
        </p>
      )}

      <div className="gallery-grid">
        {assets.map((asset) => (
          <div key={asset.id} className="asset-card">
            <div className="asset-card-thumb" onClick={() => onPreview(asset)}>
              {asset.mimeType === 'application/pdf' ? (
                <div className="asset-card-placeholder">📄</div>
              ) : asset.mimeType.startsWith('video/') &&
                asset.status !== 'ready' ? (
                <div className="asset-card-placeholder">▶</div>
              ) : (
                <img
                  src={assetUrl.thumbnail(asset.id)}
                  alt={asset.originalName}
                  loading="lazy"
                />
              )}
              {asset.status !== 'ready' && (
                <span className={`asset-status asset-status--${asset.status}`}>
                  {asset.status}
                </span>
              )}
              <div className="asset-card-overlay">
                <a
                  href={assetUrl.download(asset.id)}
                  className="asset-card-action"
                  download
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Download"
                >
                  ⬇
                </a>
                <button
                  type="button"
                  className="asset-card-action"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(asset.id)
                  }}
                  aria-label="Delete"
                >
                  🗑
                </button>
              </div>
            </div>
            <div className="asset-card-meta">
              <p className="asset-card-name" title={asset.originalName}>
                {asset.originalName}
              </p>
              <p className="asset-card-size">{formatBytes(asset.size)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
