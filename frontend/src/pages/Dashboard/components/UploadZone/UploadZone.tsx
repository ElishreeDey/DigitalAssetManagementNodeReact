/*
 ****************************************************************************************************************************
 * Filename    : UploadZone
 * Description : Drag-and-drop / click-to-browse multi-file upload zone with a queue showing per-file
 *               previews, progress, and validation errors.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-17
 ****************************************************************************************************************************
 */

import { useRef, useState } from 'react'
import { useUpload } from '../../../../hooks'
import { uploadIcon } from '../../../../assets'
import type { AssetItem } from '../../../../types'
import './UploadZone.css'

type Props = {
  onUploaded: (assets: AssetItem[]) => void
}

export default function UploadZone({ onUploaded }: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const {
    files,
    isUploading,
    validCount,
    uploadError,
    addFiles,
    removeFile,
    upload,
    clear,
  } = useUpload(onUploaded)

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    addFiles(e.dataTransfer.files)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }

  function formatBytes(b: number) {
    if (b < 1024) return `${b} B`
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
    return `${(b / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="upload-page">
      <div
        className={`drop-zone${isDragging ? ' drop-zone--active' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        aria-label="Upload files"
      >
        <img
          src={uploadIcon}
          alt=""
          width={36}
          height={36}
          className="drop-zone-icon"
        />
        <p className="drop-zone-title">
          Drag &amp; drop images, videos, or PDFs here
        </p>
        <p className="drop-zone-sub">
          or click to browse &nbsp;·&nbsp; max 50 MB per file
        </p>
        <div className="drop-zone-badges">
          <span className="badge">Images</span>
          <span className="badge">Videos</span>
          <span className="badge">PDFs</span>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*,application/pdf"
          className="upload-input-hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>

      {files.length > 0 && (
        <div className="upload-queue">
          <div className="queue-header">
            <span className="queue-count">
              {files.length} file{files.length !== 1 ? 's' : ''} selected
              {validCount < files.length &&
                ` (${files.length - validCount} invalid)`}
            </span>
            <button type="button" className="queue-clear" onClick={clear}>
              Clear all
            </button>
          </div>

          <ul className="queue-list">
            {files.map((f, i) => (
              <li
                key={i}
                className={`queue-item${f.error ? ' queue-item--error' : ''}`}
              >
                {f.preview ? (
                  <img src={f.preview} alt="" className="queue-thumb" />
                ) : f.file.type === 'application/pdf' ? (
                  <div className="queue-thumb queue-thumb--pdf">📄</div>
                ) : (
                  <div className="queue-thumb queue-thumb--video">▶</div>
                )}
                <div className="queue-meta">
                  <span className="queue-name">{f.file.name}</span>
                  <span className="queue-size">{formatBytes(f.file.size)}</span>
                  {f.error ? (
                    <span className="queue-error">{f.error}</span>
                  ) : (
                    f.progress > 0 && (
                      <div className="queue-progress">
                        <div
                          className="queue-progress-bar"
                          style={{ width: `${f.progress}%` }}
                        />
                      </div>
                    )
                  )}
                </div>
                <button
                  type="button"
                  className="queue-remove"
                  onClick={() => removeFile(i)}
                  aria-label={`Remove ${f.file.name}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>

          <div className="queue-actions">
            {uploadError && <p className="queue-upload-error">{uploadError}</p>}
            <button
              type="button"
              className="btn-upload"
              onClick={upload}
              disabled={isUploading || validCount === 0}
            >
              {isUploading
                ? 'Uploading…'
                : `Upload ${validCount} file${validCount !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
