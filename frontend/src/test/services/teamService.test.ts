/*
 ****************************************************************************************************************************
 * Filename    : teamService.test
 * Description : Unit tests for the team service — create, update, remove, list,
 *               addMember, removeMember, and listMembers.
 * Author      : Elishree Dey Chand
 * Created     : 2026-07-01
 ****************************************************************************************************************************
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}))

import { teamService } from '../../services/teamService'
import api from '../../services/api'

const mockApi = vi.mocked(api)

describe('teamService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('list', () => {
    it('calls GET /teams and returns the team array', async () => {
      const teams = [
        { id: 't1', name: 'Design' },
        { id: 't2', name: 'Backend' },
      ]
      mockApi.get.mockResolvedValue({ data: teams })
      const result = await teamService.list()
      expect(mockApi.get).toHaveBeenCalledWith('/teams')
      expect(result).toEqual(teams)
    })
  })

  //create team
  describe('create', () => {
    it('calls POST /teams with the team name and returns the new team', async () => {
      const team = { id: 't1', name: 'Design' }
      mockApi.post.mockResolvedValue({ data: team })
      const result = await teamService.create('Design')
      expect(mockApi.post).toHaveBeenCalledWith('/teams', { name: 'Design' })
      expect(result).toEqual(team)
    })
  })

  //update Teamname
  describe('update', () => {
    it('calls PATCH /teams/:id with the new name and returns the updated team', async () => {
      const updated = { id: 't1', name: 'UI/UX' }
      mockApi.patch.mockResolvedValue({ data: updated })
      const result = await teamService.update('t1', 'UI/UX')
      expect(mockApi.patch).toHaveBeenCalledWith('/teams/t1', { name: 'UI/UX' })
      expect(result).toEqual(updated)
    })
  })

  //remove team
  describe('remove', () => {
    it('calls DELETE /teams/:id', async () => {
      mockApi.delete.mockResolvedValue({})
      await teamService.remove('t1')
      expect(mockApi.delete).toHaveBeenCalledWith('/teams/t1')
    })
  })

  //listMembers
  describe('listMembers', () => {
    it('calls GET /teams/:id/members and returns the member array', async () => {
      const members = [{ userId: 'u1', email: 'a@b.com', role: 'owner' }]
      mockApi.get.mockResolvedValue({ data: members })
      const result = await teamService.listMembers('t1')
      expect(mockApi.get).toHaveBeenCalledWith('/teams/t1/members')
      expect(result).toEqual(members)
    })
  })

  //addMember
  describe('addMember', () => {
    it('calls POST /teams/:id/members with the email and returns the new member', async () => {
      const member = { userId: 'u2', email: 'new@example.com', role: 'member' }
      mockApi.post.mockResolvedValue({ data: member })
      const result = await teamService.addMember('t1', 'new@example.com')
      expect(mockApi.post).toHaveBeenCalledWith('/teams/t1/members', {
        email: 'new@example.com',
      })
      expect(result).toEqual(member)
    })
  })

  //removeMember
  describe('removeMember', () => {
    it('calls DELETE /teams/:teamId/members/:userId', async () => {
      mockApi.delete.mockResolvedValue({})
      await teamService.removeMember('t1', 'u2')
      expect(mockApi.delete).toHaveBeenCalledWith('/teams/t1/members/u2')
    })
  })
})
