/*
 ****************************************************************************************************************************
 * Filename    : AssetGallery
 * Description : Displays uploaded assets with search, filtering, preview, download, and delete actions.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-17
 ****************************************************************************************************************************
 */

import { assetUrl } from '../../../../constants'
import { trashIcon, downloadIcon, pdfIcon, playIcon } from '../../../../assets'
import type { AssetItem } from '../../../../types'
import './AssetGallery.css'

type AssetSource = 'mine' | 'shared'

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
  source: AssetSource
  onSourceChange: (source: AssetSource) => void
  currentUserId?: string
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
  source,
  onSourceChange,
  currentUserId,
}: Props) {
  function formatBytes(b: number) {
    if (b < 1024) return `${b} B`
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
    return `${(b / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="gallery-page">
      {/* Assest gallery toggle based on all personal assets or team assets */}
      <div className="gallery-source-toggle">
        <button
          type="button"
          className={`source-tab${source === 'mine' ? ' source-tab--active' : ''}`}
          onClick={() => onSourceChange('mine')}
        >
          My Assets
        </button>
        <button
          type="button"
          className={`source-tab${source === 'shared' ? ' source-tab--active' : ''}`}
          onClick={() => onSourceChange('shared')}
        >
          Team Assets
        </button>
      </div>

      <div className="gallery-toolbar">
        {/* search by tags or filename */}
        <input
          type="search"
          placeholder="Search by filename…"
          className="gallery-search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />

        {/* filter by all or image or video or document */}
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
          {source === 'shared'
            ? 'No team assets yet — ask a team member to upload files to your team.'
            : 'No assets yet — upload your first file.'}
        </p>
      )}

      <div className="gallery-grid">
        {assets.map((asset) => (
          <div key={asset.id} className="asset-card">
            <div className="asset-card-thumb" onClick={() => onPreview(asset)}>
              {asset.status !== 'ready' &&
              (asset.mimeType.startsWith('video/') ||
                asset.mimeType === 'application/pdf') ? (
                <div className="asset-card-placeholder">
                  <img
                    src={
                      asset.mimeType === 'application/pdf' ? pdfIcon : playIcon
                    }
                    alt=""
                  />
                </div>
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
              {source === 'shared' && asset.teamName && (
                <span className="show-asset-team-name">{asset.teamName}</span>
              )}
              <div className="asset-card-overlay">
                <a
                  href={assetUrl.download(asset.id)}
                  className="asset-card-action"
                  data-tooltip="Download"
                  download
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Download"
                >
                  <img src={downloadIcon} alt="" width={16} height={16} />
                </a>
                {asset.uploadedBy === currentUserId && (
                  <button
                    type="button"
                    className="asset-card-action"
                    data-tooltip="Delete"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(asset.id)
                    }}
                    aria-label="Delete"
                  >
                    <img src={trashIcon} alt="" width={16} height={16} />
                  </button>
                )}
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
