/*
 ****************************************************************************************************************************
 * Filename    : useTeams.test
 * Description : Unit tests for the useTeams hook — initial fetch, createTeam, updateTeam,
 *               removeTeam, fetchMembers, addMember, and removeMember.
 *               teamService is mocked via the services barrel so no real HTTP calls are made.
 * Author      : Elishree Dey Chand
 * Created     : 2026-07-01
 ****************************************************************************************************************************
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { TEAM_TOAST } from '../../constants'
import type { Team, TeamMember } from '../../types'

vi.mock('../../services', () => ({
  teamService: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    listMembers: vi.fn(),
    addMember: vi.fn(),
    removeMember: vi.fn(),
  },
}))

import { useTeams } from '../../hooks/useTeams'
import { teamService } from '../../services'

const mockTeamService = vi.mocked(teamService)

// Minimal team factory.
function makeTeam(overrides: Partial<Team> = {}): Team {
  return { id: 't1', name: 'Design', ...overrides } as Team
}

// Minimal team member factory.
function makeMember(overrides: Partial<TeamMember> = {}): TeamMember {
  return {
    userId: 'u1',
    role: 'owner',
    user: { id: 'u1', email: 'alice@example.com' },
    ...overrides,
  } as TeamMember
}

describe('useTeams', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches teams on mount and sets isLoading to false', async () => {
    const teams = [
      makeTeam({ id: 't1' }),
      makeTeam({ id: 't2', name: 'Backend' }),
    ]
    mockTeamService.list.mockResolvedValue(teams)

    const { result } = renderHook(() => useTeams())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.teams).toEqual(teams)
    expect(result.current.error).toBeNull()
    expect(mockTeamService.list).toHaveBeenCalledOnce()
  })

  it('sets TEAM_TOAST.TEAMS_LOAD_FAILED error when the initial fetch throws', async () => {
    mockTeamService.list.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useTeams())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe(TEAM_TOAST.TEAMS_LOAD_FAILED)
    expect(result.current.teams).toEqual([])
  })

  it('createTeam prepends the new team to the list', async () => {
    mockTeamService.list.mockResolvedValue([
      makeTeam({ id: 't1', name: 'Design' }),
    ])
    const newTeam = makeTeam({ id: 't2', name: 'Backend' })
    mockTeamService.create.mockResolvedValue(newTeam)

    const { result } = renderHook(() => useTeams())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.createTeam('Backend')
    })

    expect(mockTeamService.create).toHaveBeenCalledWith('Backend')
    expect(result.current.teams[0]).toEqual(newTeam)
    expect(result.current.teams).toHaveLength(2)
  })

  it('updateTeam replaces the matching team in state', async () => {
    const original = makeTeam({ id: 't1', name: 'Design' })
    mockTeamService.list.mockResolvedValue([original])
    const updated = makeTeam({ id: 't1', name: 'UI/UX' })
    mockTeamService.update.mockResolvedValue(updated)

    const { result } = renderHook(() => useTeams())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.updateTeam('t1', 'UI/UX')
    })

    expect(mockTeamService.update).toHaveBeenCalledWith('t1', 'UI/UX')
    expect(result.current.teams[0].name).toBe('UI/UX')
  })

  it('removeTeam deletes the team and removes it from state', async () => {
    const teams = [
      makeTeam({ id: 't1' }),
      makeTeam({ id: 't2', name: 'Backend' }),
    ]
    mockTeamService.list.mockResolvedValue(teams)
    mockTeamService.remove.mockResolvedValue(undefined)

    const { result } = renderHook(() => useTeams())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.removeTeam('t1')
    })

    expect(mockTeamService.remove).toHaveBeenCalledWith('t1')
    expect(result.current.teams).toHaveLength(1)
    expect(result.current.teams[0].id).toBe('t2')
  })

  it('fetchMembers stores members keyed by teamId', async () => {
    mockTeamService.list.mockResolvedValue([makeTeam()])
    const members = [
      makeMember({ userId: 'u1' }),
      makeMember({
        userId: 'u2',
        role: 'member',
        user: { id: 'u2', email: 'bob@example.com' },
      }),
    ]
    mockTeamService.listMembers.mockResolvedValue(members)

    const { result } = renderHook(() => useTeams())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.fetchMembers('t1')
    })

    expect(mockTeamService.listMembers).toHaveBeenCalledWith('t1')
    expect(result.current.members['t1']).toEqual(members)
  })

  it('addMember calls teamService.addMember then re-fetches the member list', async () => {
    mockTeamService.list.mockResolvedValue([makeTeam()])
    const membersAfterAdd = [
      makeMember(),
      makeMember({
        userId: 'u2',
        role: 'member',
        user: { id: 'u2', email: 'bob@example.com' },
      }),
    ]
    mockTeamService.addMember.mockResolvedValue(
      makeMember({
        userId: 'u2',
        role: 'member',
        user: { id: 'u2', email: 'bob@example.com' },
      })
    )
    mockTeamService.listMembers.mockResolvedValue(membersAfterAdd)

    const { result } = renderHook(() => useTeams())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.addMember('t1', 'bob@example.com')
    })

    expect(mockTeamService.addMember).toHaveBeenCalledWith(
      't1',
      'bob@example.com'
    )
    // fetchMembers is called internally to populate the updated list.
    expect(mockTeamService.listMembers).toHaveBeenCalledWith('t1')
    expect(result.current.members['t1']).toEqual(membersAfterAdd)
  })

  it('removeMember calls teamService.removeMember and removes the member from state', async () => {
    mockTeamService.list.mockResolvedValue([makeTeam()])
    const members = [
      makeMember({ userId: 'u1' }),
      makeMember({
        userId: 'u2',
        role: 'member',
        user: { id: 'u2', email: 'bob@example.com' },
      }),
    ]
    mockTeamService.listMembers.mockResolvedValue(members)
    mockTeamService.removeMember.mockResolvedValue(undefined)

    const { result } = renderHook(() => useTeams())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // Populate members first.
    await act(async () => {
      await result.current.fetchMembers('t1')
    })
    expect(result.current.members['t1']).toHaveLength(2)

    await act(async () => {
      await result.current.removeMember('t1', 'u1')
    })

    expect(mockTeamService.removeMember).toHaveBeenCalledWith('t1', 'u1')
    expect(result.current.members['t1']).toHaveLength(1)
    expect(result.current.members['t1'][0].userId).toBe('u2')
  })
})
