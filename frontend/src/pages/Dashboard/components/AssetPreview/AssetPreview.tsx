/*
 ****************************************************************************************************************************
 * Filename    : AssetPreview
 * Description : Full-screen modal for previewing an image/video asset alongside its metadata and tags.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-17
 ****************************************************************************************************************************
 */

import { useEffect } from 'react'
import { assetUrl } from '../../../../constants'
import type { AssetItem } from '../../../../types'
import './AssetPreview.css'

type Props = {
  asset: AssetItem | null
  onClose: () => void
}

export default function AssetPreview({ asset, onClose }: Props) {
  useEffect(() => {
    if (!asset) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [asset, onClose])

  if (!asset) return null

  const isImage = asset.mimeType.startsWith('image/')
  const isVideo = asset.mimeType.startsWith('video/')

  return (
    <div className="preview-overlay" onClick={onClose}>
      <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="preview-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <div className="preview-media">
          {isImage && (
            <img
              src={assetUrl.view(asset.id)}
              alt={asset.originalName}
              className="preview-img"
            />
          )}
          {isVideo && (
            <video
              src={assetUrl.view(asset.id)}
              controls
              className="preview-video"
            />
          )}
          {!isImage && !isVideo && (
            <div className="preview-no-media">
              <span className="preview-file-icon">📄</span>
              <p>No preview available</p>
            </div>
          )}
        </div>

        <div className="preview-info">
          <h3 className="preview-filename">{asset.originalName}</h3>

          <dl className="preview-meta-list">
            <div className="preview-meta-row">
              <dt>Type</dt>
              <dd>{asset.mimeType}</dd>
            </div>
            <div className="preview-meta-row">
              <dt>Size</dt>
              <dd>{(asset.size / (1024 * 1024)).toFixed(2)} MB</dd>
            </div>
            {asset.width && asset.height && (
              <div className="preview-meta-row">
                <dt>Dimensions</dt>
                <dd>
                  {asset.width} × {asset.height}
                </dd>
              </div>
            )}
            <div className="preview-meta-row">
              <dt>Uploaded</dt>
              <dd>{new Date(asset.createdAt).toLocaleString()}</dd>
            </div>
            <div className="preview-meta-row">
              <dt>Status</dt>
              <dd>
                <span
                  className={`preview-status preview-status--${asset.status}`}
                >
                  {asset.status}
                </span>
              </dd>
            </div>
            <div className="preview-meta-row">
              <dt>Downloads</dt>
              <dd>{asset.downloadCount}</dd>
            </div>
          </dl>

          {asset.tags.length > 0 && (
            <div className="preview-tags-section">
              <span className="preview-tags-label">Tags</span>
              <div className="preview-tags">
                {asset.tags.map((tag) => (
                  <span key={tag} className="preview-tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <a
            href={assetUrl.download(asset.id)}
            download
            className="preview-download-btn"
          >
            Download
          </a>
        </div>
      </div>
    </div>
  )
}
