/*
 ****************************************************************************************************************************
 * Filename    : UploadZone.test
 * Description : Component tests for UploadZone — drop-zone rendering, team selector visibility,
 *               file queue display, invalid-file error messages, clear button, upload button
 *               label, and disabled state. useUpload and useTeams are mocked via the hooks barrel.
 * Author      : Elishree Dey Chand
 * Created     : 2026-07-01
 ****************************************************************************************************************************
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { UploadFileState } from '../../types'

vi.mock('../../assets', () => ({
  uploadIcon: 'upload.svg',
  pdfIcon: 'pdf.svg',
  playIcon: 'play.svg',
  removeIcon: 'remove.svg',
}))

vi.mock('../../hooks', () => ({
  useUpload: vi.fn(),
  useTeams: vi.fn(),
}))

import UploadZone from '../../pages/Dashboard/components/UploadZone/UploadZone'
import { useUpload, useTeams } from '../../hooks'

const mockUseUpload = vi.mocked(useUpload)
const mockUseTeams = vi.mocked(useTeams)

// Factory for a valid upload file state entry.
function makeFileState(
  overrides: Partial<UploadFileState> = {}
): UploadFileState {
  return {
    file: new File(['content'], 'photo.jpg', { type: 'image/jpeg' }),
    progress: 0,
    error: null,
    preview: 'blob:mock-preview',
    ...overrides,
  }
}

// Minimal upload hook return with all handlers as vi.fn().
function defaultUpload(overrides = {}) {
  return {
    files: [] as UploadFileState[],
    isUploading: false,
    validCount: 0,
    uploadError: null as string | null,
    addFiles: vi.fn(),
    removeFile: vi.fn(),
    upload: vi.fn(),
    clear: vi.fn(),
    ...overrides,
  }
}

// Minimal teams hook return.
function defaultTeams(overrides = {}) {
  return {
    teams: [],
    isLoading: false,
    error: null,
    members: {},
    createTeam: vi.fn(),
    updateTeam: vi.fn(),
    removeTeam: vi.fn(),
    fetchMembers: vi.fn(),
    addMember: vi.fn(),
    removeMember: vi.fn(),
    ...overrides,
  }
}

describe('UploadZone', () => {
  const onUploaded = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseUpload.mockReturnValue(defaultUpload())
    mockUseTeams.mockReturnValue(defaultTeams())
  })

  it('renders the drop-zone area with the correct aria-label', () => {
    render(<UploadZone onUploaded={onUploaded} />)
    expect(
      screen.getByRole('button', { name: 'Upload files' })
    ).toBeInTheDocument()
  })

  it('does NOT render the team selector when there are no teams', () => {
    render(<UploadZone onUploaded={onUploaded} />)
    expect(screen.queryByLabelText('Upload to')).toBeNull()
  })

  it('renders the team selector dropdown when teams exist', () => {
    mockUseTeams.mockReturnValue(
      defaultTeams({ teams: [{ id: 't1', name: 'Design', createdAt: '' }] })
    )
    render(<UploadZone onUploaded={onUploaded} />)
    expect(screen.getByLabelText('Upload to')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Design' })).toBeInTheDocument()
  })

  it('does NOT show the file queue when files list is empty', () => {
    render(<UploadZone onUploaded={onUploaded} />)
    expect(screen.queryByText(/file.*selected/i)).toBeNull()
  })

  it('shows the file queue with the file name when files are added', () => {
    mockUseUpload.mockReturnValue(
      defaultUpload({ files: [makeFileState()], validCount: 1 })
    )
    render(<UploadZone onUploaded={onUploaded} />)
    expect(screen.getByText('1 file selected')).toBeInTheDocument()
    expect(screen.getByText('photo.jpg')).toBeInTheDocument()
  })

  it('shows the invalid count when some files have validation errors', () => {
    const files = [
      makeFileState(),
      makeFileState({
        file: new File(['x'], 'bad.txt', { type: 'text/plain' }),
        error: 'Invalid type',
        preview: null,
      }),
    ]
    mockUseUpload.mockReturnValue(defaultUpload({ files, validCount: 1 }))
    render(<UploadZone onUploaded={onUploaded} />)
    expect(
      screen.getByText(/2 files selected \(1 invalid\)/)
    ).toBeInTheDocument()
    expect(screen.getByText('Invalid type')).toBeInTheDocument()
  })

  it('calls clear when the "Clear all" button is clicked', () => {
    const clear = vi.fn()
    mockUseUpload.mockReturnValue(
      defaultUpload({ files: [makeFileState()], validCount: 1, clear })
    )
    render(<UploadZone onUploaded={onUploaded} />)
    fireEvent.click(screen.getByRole('button', { name: 'Clear all' }))
    expect(clear).toHaveBeenCalledOnce()
  })

  it('disables the upload button when validCount is 0', () => {
    mockUseUpload.mockReturnValue(
      defaultUpload({
        files: [makeFileState({ error: 'Invalid type', preview: null })],
        validCount: 0,
      })
    )
    render(<UploadZone onUploaded={onUploaded} />)
    expect(screen.getByRole('button', { name: /Upload 0/i })).toBeDisabled()
  })

  it('shows "Uploading…" and disables the button while upload is in progress', () => {
    mockUseUpload.mockReturnValue(
      defaultUpload({
        files: [makeFileState()],
        validCount: 1,
        isUploading: true,
      })
    )
    render(<UploadZone onUploaded={onUploaded} />)
    expect(screen.getByRole('button', { name: 'Uploading…' })).toBeDisabled()
  })

  it('calls removeFile with the correct index when a remove button is clicked', () => {
    const removeFile = vi.fn()
    mockUseUpload.mockReturnValue(
      defaultUpload({ files: [makeFileState()], validCount: 1, removeFile })
    )
    render(<UploadZone onUploaded={onUploaded} />)
    fireEvent.click(screen.getByRole('button', { name: 'Remove photo.jpg' }))
    expect(removeFile).toHaveBeenCalledWith(0)
  })

  it('shows the upload error message when uploadError is set', () => {
    mockUseUpload.mockReturnValue(
      defaultUpload({
        files: [makeFileState()],
        validCount: 1,
        uploadError: 'Upload failed',
      })
    )
    render(<UploadZone onUploaded={onUploaded} />)
    expect(screen.getByText('Upload failed')).toBeInTheDocument()
  })
})
