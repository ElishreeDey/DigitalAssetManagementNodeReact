/*
 ****************************************************************************************************************************
 * Filename    : AssetGallery.test
 * Description : Component tests for AssetGallery — loading/error/empty states, asset card rendering,
 *               source toggle, search, type-filter tabs, sort select, preview click,
 *               delete confirmation flow, and size formatting. Purely prop-driven; no hook mocks needed.
 * Author      : Elishree Dey Chand
 * Created     : 2026-07-01
 ****************************************************************************************************************************
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { AssetItem } from '../../types'

vi.mock('../../assets', () => ({
  trashIcon: 'trash.svg',
  downloadIcon: 'download.svg',
  pdfIcon: 'pdf.svg',
  playIcon: 'play.svg',
}))

import AssetGallery from '../../pages/Dashboard/components/AssetGallery/AssetGallery'

function makeAsset(overrides: Partial<AssetItem> = {}): AssetItem {
  return {
    id: 'a1',
    originalName: 'photo.jpg',
    mimeType: 'image/jpeg',
    size: 1024 * 1024,
    tags: [],
    status: 'ready',
    width: null,
    height: null,
    renditions: [],
    downloadCount: 0,
    createdAt: new Date().toISOString(),
    uploadedBy: 'user-1',
    ...overrides,
  }
}

// Default prop set — keeps each test focused on one variation.
function defaultProps(overrides = {}) {
  return {
    assets: [],
    isLoading: false,
    error: null,
    onDelete: vi.fn(),
    onPreview: vi.fn(),
    search: '',
    onSearchChange: vi.fn(),
    typeFilter: 'all',
    onTypeChange: vi.fn(),
    sortOrder: 'desc' as const,
    onSortChange: vi.fn(),
    source: 'mine' as const,
    onSourceChange: vi.fn(),
    currentUserId: 'user-1',
    ...overrides,
  }
}

describe('AssetGallery', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows a loading message while assets are being fetched', () => {
    render(<AssetGallery {...defaultProps({ isLoading: true })} />)
    expect(screen.getByText('Loading assets…')).toBeInTheDocument()
  })

  it('shows an error message when an error is present', () => {
    render(
      <AssetGallery {...defaultProps({ error: 'Failed to load assets' })} />
    )
    expect(screen.getByText('Failed to load assets')).toBeInTheDocument()
  })

  it('shows the "mine" empty-state message when there are no assets and source is "mine"', () => {
    render(<AssetGallery {...defaultProps({ source: 'mine' })} />)
    expect(
      screen.getByText('No assets yet — upload your first file.')
    ).toBeInTheDocument()
  })

  it('shows the "shared" empty-state message when source is "shared"', () => {
    render(<AssetGallery {...defaultProps({ source: 'shared' })} />)
    expect(screen.getByText(/No team assets yet/)).toBeInTheDocument()
  })

  it('renders a card for each asset with name and formatted size', () => {
    const assets = [
      makeAsset({ id: 'a1', originalName: 'photo.jpg', size: 1024 * 1024 }),
      makeAsset({ id: 'a2', originalName: 'doc.pdf', size: 512 }),
    ]
    render(<AssetGallery {...defaultProps({ assets })} />)
    expect(screen.getByText('photo.jpg')).toBeInTheDocument()
    expect(screen.getByText('doc.pdf')).toBeInTheDocument()
    expect(screen.getByText('1.0 MB')).toBeInTheDocument()
    expect(screen.getByText('512 B')).toBeInTheDocument()
  })

  it('calls onPreview when an asset card thumbnail is clicked', () => {
    const onPreview = vi.fn()
    const asset = makeAsset()
    render(<AssetGallery {...defaultProps({ assets: [asset], onPreview })} />)
    fireEvent.click(document.querySelector('.asset-card-thumb')!)
    expect(onPreview).toHaveBeenCalledWith(asset)
  })

  it('calls onSourceChange("shared") when "Team Assets" tab is clicked', () => {
    const onSourceChange = vi.fn()
    render(<AssetGallery {...defaultProps({ onSourceChange })} />)
    fireEvent.click(screen.getByRole('button', { name: 'Team Assets' }))
    expect(onSourceChange).toHaveBeenCalledWith('shared')
  })

  it('calls onSourceChange("mine") when "My Assets" tab is clicked', () => {
    const onSourceChange = vi.fn()
    render(
      <AssetGallery {...defaultProps({ source: 'shared', onSourceChange })} />
    )
    fireEvent.click(screen.getByRole('button', { name: 'My Assets' }))
    expect(onSourceChange).toHaveBeenCalledWith('mine')
  })

  it('calls onSearchChange when the search input changes', () => {
    const onSearchChange = vi.fn()
    render(<AssetGallery {...defaultProps({ onSearchChange })} />)
    fireEvent.change(screen.getByPlaceholderText('Search by filename…'), {
      target: { value: 'report' },
    })
    expect(onSearchChange).toHaveBeenCalledWith('report')
  })

  it('calls onTypeChange when a type-filter tab is clicked', () => {
    const onTypeChange = vi.fn()
    render(<AssetGallery {...defaultProps({ onTypeChange })} />)
    fireEvent.click(screen.getByRole('button', { name: 'Images' }))
    expect(onTypeChange).toHaveBeenCalledWith('image')
  })

  it('calls onSortChange when the sort dropdown changes', () => {
    const onSortChange = vi.fn()
    render(<AssetGallery {...defaultProps({ onSortChange })} />)
    fireEvent.change(screen.getByRole('combobox', { name: 'Sort assets' }), {
      target: { value: 'asc' },
    })
    expect(onSortChange).toHaveBeenCalledWith('asc')
  })

  it('shows the delete button only for assets owned by the current user', () => {
    const assets = [
      makeAsset({ id: 'a1', uploadedBy: 'user-1' }), // mine
      makeAsset({ id: 'a2', uploadedBy: 'user-2' }), // someone else
    ]
    render(
      <AssetGallery {...defaultProps({ assets, currentUserId: 'user-1' })} />
    )
    expect(screen.getAllByRole('button', { name: 'Delete' })).toHaveLength(1)
  })

  it('opens the ConfirmModal when a delete button is clicked', () => {
    const asset = makeAsset({ id: 'a1', uploadedBy: 'user-1' })
    render(<AssetGallery {...defaultProps({ assets: [asset] })} />)
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(
      screen.getByText(/Are you sure you want to delete this asset/)
    ).toBeInTheDocument()
  })

  it('calls onDelete and closes the modal when the ConfirmModal "Yes" button is clicked', () => {
    const onDelete = vi.fn()
    const asset = makeAsset({ id: 'a1', uploadedBy: 'user-1' })
    render(<AssetGallery {...defaultProps({ assets: [asset], onDelete })} />)

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    fireEvent.click(screen.getByRole('button', { name: 'Yes' }))

    expect(onDelete).toHaveBeenCalledWith('a1')
    expect(
      screen.queryByText(/Are you sure you want to delete this asset/)
    ).toBeNull()
  })

  it('closes the modal without calling onDelete when Cancel is clicked', () => {
    const onDelete = vi.fn()
    const asset = makeAsset({ id: 'a1', uploadedBy: 'user-1' })
    render(<AssetGallery {...defaultProps({ assets: [asset], onDelete })} />)

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onDelete).not.toHaveBeenCalled()
    expect(
      screen.queryByText(/Are you sure you want to delete this asset/)
    ).toBeNull()
  })
})
