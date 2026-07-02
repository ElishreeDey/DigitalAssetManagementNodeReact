/*
 ****************************************************************************************************************************
 * Filename    : Teams.test
 * Description : Component tests for the Teams component — loading/error/empty states, team list
 *               rendering, create-team form, expand/collapse, member display, delete confirmation
 *               modal. useTeams, authService, axios, and react-toastify are mocked.
 * Author      : Elishree Dey Chand
 * Created     : 2026-07-01
 ****************************************************************************************************************************
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import type { Team, TeamMember } from '../../types'

vi.mock('../../assets', () => ({
  trashIcon: 'trash.svg',
  editIcon: 'edit.svg',
  arrowUpIcon: 'arrow-up.svg',
  arrowDownIcon: 'arrow-down.svg',
}))

vi.mock('../../hooks', () => ({
  useTeams: vi.fn(),
}))

vi.mock('../../services', () => ({
  authService: { listAccounts: vi.fn() },
}))

vi.mock('react-toastify', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('axios', () => ({
  default: { isAxiosError: vi.fn().mockReturnValue(false) },
}))

import Teams from '../../pages/Dashboard/components/Teams/Teams'
import { useTeams } from '../../hooks'
import { authService } from '../../services'

const mockUseTeams = vi.mocked(useTeams)
const mockAuthService = vi.mocked(authService)

function makeTeam(overrides: Partial<Team> = {}): Team {
  return {
    id: 't1',
    name: 'Design',
    createdAt: '2026-06-01T00:00:00.000Z',
    ...overrides,
  } as Team
}

function makeMember(overrides: Partial<TeamMember> = {}): TeamMember {
  return {
    id: 'm1',
    userId: 'u1',
    role: 'owner',
    user: { email: 'owner@example.com' },
    ...overrides,
  } as unknown as TeamMember
}

function defaultTeams(overrides = {}) {
  return {
    teams: [] as Team[],
    isLoading: false,
    error: null as string | null,
    members: {} as Record<string, TeamMember[]>,
    createTeam: vi.fn(),
    updateTeam: vi.fn(),
    removeTeam: vi.fn().mockResolvedValue(undefined),
    fetchMembers: vi.fn().mockResolvedValue(undefined),
    addMember: vi.fn(),
    removeMember: vi.fn(),
    ...overrides,
  }
}

describe('Teams', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseTeams.mockReturnValue(defaultTeams())
    // Suppress the listAccounts call on mount.
    mockAuthService.listAccounts.mockResolvedValue([])
  })

  it('shows a loading message while teams are being fetched', () => {
    mockUseTeams.mockReturnValue(defaultTeams({ isLoading: true }))
    render(<Teams currentUserId="u1" />)
    expect(screen.getByText('Loading teams…')).toBeInTheDocument()
  })

  it('shows an error message when the fetch fails', () => {
    mockUseTeams.mockReturnValue(
      defaultTeams({ error: 'Failed to load teams' })
    )
    render(<Teams currentUserId="u1" />)
    expect(screen.getByText('Failed to load teams')).toBeInTheDocument()
  })

  it('shows the empty-state message when there are no teams', () => {
    render(<Teams currentUserId="u1" />)
    expect(
      screen.getByText('No teams yet — create your first team.')
    ).toBeInTheDocument()
  })

  it('renders the create-team form with input and button', () => {
    render(<Teams currentUserId="u1" />)
    expect(screen.getByPlaceholderText('New team name…')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Create Team' })
    ).toBeInTheDocument()
  })

  it('calls createTeam when the create-team form is submitted with a name', async () => {
    const createTeam = vi.fn().mockResolvedValue(undefined)
    mockUseTeams.mockReturnValue(defaultTeams({ createTeam }))
    render(<Teams currentUserId="u1" />)

    fireEvent.change(screen.getByPlaceholderText('New team name…'), {
      target: { value: 'Backend' },
    })
    fireEvent.submit(
      screen.getByPlaceholderText('New team name…').closest('form')!
    )

    await waitFor(() => expect(createTeam).toHaveBeenCalledWith('Backend'))
  })

  it('does NOT call createTeam when the input is empty', async () => {
    const createTeam = vi.fn()
    mockUseTeams.mockReturnValue(defaultTeams({ createTeam }))
    render(<Teams currentUserId="u1" />)
    fireEvent.submit(
      screen.getByPlaceholderText('New team name…').closest('form')!
    )
    await waitFor(() => expect(createTeam).not.toHaveBeenCalled())
  })

  it('renders a team card with name and creation date', () => {
    mockUseTeams.mockReturnValue(
      defaultTeams({
        teams: [
          makeTeam({
            id: 't1',
            name: 'Design',
            createdAt: '2026-06-01T00:00:00.000Z',
          }),
        ],
      })
    )
    render(<Teams currentUserId="u1" />)
    expect(screen.getByText('Design')).toBeInTheDocument()
    expect(screen.getByText(/Created/)).toBeInTheDocument()
  })

  it('expands the team card and shows members when the header is clicked', () => {
    mockUseTeams.mockReturnValue(
      defaultTeams({
        teams: [makeTeam()],
        members: {
          t1: [
            makeMember({
              userId: 'u1',
              role: 'owner',
              user: { id: 'u1', email: 'owner@example.com' },
            }),
          ],
        },
      })
    )
    render(<Teams currentUserId="u1" />)
    fireEvent.click(screen.getByText('Design'))
    expect(screen.getByText('owner@example.com')).toBeInTheDocument()
    expect(screen.getByText('owner')).toBeInTheDocument()
  })

  it('shows the delete ConfirmModal when the delete button is clicked', () => {
    mockUseTeams.mockReturnValue(
      defaultTeams({
        teams: [makeTeam()],
        members: {
          t1: [
            makeMember({
              userId: 'u1',
              role: 'owner',
              user: { id: 'u1', email: 'owner@example.com' },
            }),
          ],
        },
      })
    )
    render(<Teams currentUserId="u1" />)

    // Expand the team first so the delete button becomes visible.
    fireEvent.click(screen.getByText('Design'))
    fireEvent.click(screen.getByRole('button', { name: 'Delete team' }))

    expect(
      screen.getByText(/Are you sure you want to delete this team/)
    ).toBeInTheDocument()
  })

  it('calls removeTeam when the ConfirmModal "Yes" button is confirmed', async () => {
    const removeTeam = vi.fn().mockResolvedValue(undefined)
    mockUseTeams.mockReturnValue(
      defaultTeams({
        teams: [makeTeam()],
        members: {
          t1: [
            makeMember({
              userId: 'u1',
              role: 'owner',
              user: { id: 'u1', email: 'owner@example.com' },
            }),
          ],
        },
        removeTeam,
      })
    )
    render(<Teams currentUserId="u1" />)

    fireEvent.click(screen.getByText('Design'))
    fireEvent.click(screen.getByRole('button', { name: 'Delete team' }))
    fireEvent.click(screen.getByRole('button', { name: 'Yes' }))

    await waitFor(() => expect(removeTeam).toHaveBeenCalledWith('t1'))
  })
})
