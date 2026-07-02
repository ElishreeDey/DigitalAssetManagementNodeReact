/*
 ****************************************************************************************************************************
 * Filename    : AssetPreview.test
 * Description : Component tests for AssetPreview — null guard, image/video/PDF rendering,
 *               metadata display, close button, overlay click, and Escape key handler.
 *               No hooks are used; the component is purely prop-driven.
 * Author      : Elishree Dey Chand
 * Created     : 2026-07-01
 ****************************************************************************************************************************
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { AssetItem } from '../../types'

vi.mock('../../assets', () => ({
  pdfIcon: 'pdf.svg',
  closeIcon: 'close.svg',
}))

import AssetPreview from '../../pages/Dashboard/components/AssetPreview/AssetPreview'

function makeAsset(overrides: Partial<AssetItem> = {}): AssetItem {
  return {
    id: 'a1',
    originalName: 'photo.jpg',
    mimeType: 'image/jpeg',
    size: 2 * 1024 * 1024,
    tags: [],
    status: 'ready',
    width: 1920,
    height: 1080,
    renditions: [],
    downloadCount: 5,
    createdAt: '2026-06-01T10:00:00.000Z',
    ...overrides,
  }
}

describe('AssetPreview', () => {
  const onClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when asset is null', () => {
    const { container } = render(
      <AssetPreview asset={null} onClose={onClose} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders an <img> for image assets', () => {
    render(
      <AssetPreview
        asset={makeAsset({ mimeType: 'image/jpeg' })}
        onClose={onClose}
      />
    )
    // The preview image (not the close icon) should have the asset filename as alt.
    expect(screen.getByAltText('photo.jpg')).toBeInTheDocument()
  })

  it('renders a <video> element for video assets', () => {
    render(
      <AssetPreview
        asset={makeAsset({ mimeType: 'video/mp4', originalName: 'clip.mp4' })}
        onClose={onClose}
      />
    )
    expect(document.querySelector('video')).toBeInTheDocument()
    expect(screen.queryByAltText('clip.mp4')).toBeNull()
  })

  it('renders "No preview available" for PDF and other non-media types', () => {
    render(
      <AssetPreview
        asset={makeAsset({
          mimeType: 'application/pdf',
          originalName: 'doc.pdf',
        })}
        onClose={onClose}
      />
    )
    expect(screen.getByText('No preview available')).toBeInTheDocument()
  })

  it('shows the asset filename and metadata', () => {
    render(<AssetPreview asset={makeAsset()} onClose={onClose} />)
    expect(
      screen.getByRole('heading', { name: 'photo.jpg' })
    ).toBeInTheDocument()
    expect(screen.getByText('image/jpeg')).toBeInTheDocument()
    // Size shown as MB — 2 MB asset.
    expect(screen.getByText('2.00 MB')).toBeInTheDocument()
  })

  it('shows dimensions when width and height are present', () => {
    render(
      <AssetPreview
        asset={makeAsset({ width: 1920, height: 1080 })}
        onClose={onClose}
      />
    )
    expect(screen.getByText('1920 × 1080')).toBeInTheDocument()
  })

  it('renders tags when the asset has tags', () => {
    render(
      <AssetPreview
        asset={makeAsset({ tags: ['nature', 'landscape'] })}
        onClose={onClose}
      />
    )
    expect(screen.getByText('nature')).toBeInTheDocument()
    expect(screen.getByText('landscape')).toBeInTheDocument()
  })

  it('calls onClose when the close button is clicked', () => {
    render(<AssetPreview asset={makeAsset()} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when the overlay backdrop is clicked', () => {
    const { container } = render(
      <AssetPreview asset={makeAsset()} onClose={onClose} />
    )
    fireEvent.click(container.querySelector('.preview-overlay')!)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when the Escape key is pressed', () => {
    render(<AssetPreview asset={makeAsset()} onClose={onClose} />)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('does NOT call onClose when the inner modal is clicked', () => {
    const { container } = render(
      <AssetPreview asset={makeAsset()} onClose={onClose} />
    )
    fireEvent.click(container.querySelector('.preview-modal')!)
    expect(onClose).not.toHaveBeenCalled()
  })
})
