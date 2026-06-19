/*
 ****************************************************************************************************************************
 * Filename    : AssetGallery
 * Description : Grid view of uploaded assets with search, type filter, status badges, and per-card
 *               preview/download/delete actions. Thumbnails load from the public thumbnail endpoint.
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
}

const TYPE_TABS = [
  { key: 'all', label: 'All' },
  { key: 'image', label: 'Images' },
  { key: 'video', label: 'Videos' },
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
}: Props) {
  function formatBytes(b: number) {
    if (b < 1024) return `${b} B`
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
    return `${(b / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="gallery-page">
      <div className="gallery-toolbar">
        <input
          type="search"
          placeholder="Search by filename…"
          className="gallery-search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
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
              {asset.mimeType.startsWith('video/') &&
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
