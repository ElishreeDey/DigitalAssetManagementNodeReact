/*
 ****************************************************************************************************************************
 * Filename    : teamController.test
 * Description : Unit tests for all team management endpoints — createTeam, listTeams,
 *               listMembers, addMember, removeMember, deleteTeam, and updateTeam.
 *               teamRepository and AuthUserRepository are mocked so no DB calls are made.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-30
 ****************************************************************************************************************************
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// vi.hoisted ensures these mock functions are available inside the vi.mock
const {
  mockCreateTeam,
  mockListForUser,
  mockFindById,
  mockFindMembership,
  mockListMembers,
  mockAddMember,
  mockRemoveMember,
  mockCountOwners,
  mockDeleteTeam,
  mockUpdateName,
  mockFindByEmail,
} = vi.hoisted(() => ({
  mockCreateTeam: vi.fn(),
  mockListForUser: vi.fn(),
  mockFindById: vi.fn(),
  mockFindMembership: vi.fn(),
  mockListMembers: vi.fn(),
  mockAddMember: vi.fn(),
  mockRemoveMember: vi.fn(),
  mockCountOwners: vi.fn(),
  mockDeleteTeam: vi.fn(),
  mockUpdateName: vi.fn(),
  mockFindByEmail: vi.fn(),
}))

// Mock the repositories barrel so no Sequelize models are imported.
vi.mock('../../repositories', () => ({
  teamRepository: {
    createTeam: mockCreateTeam,
    listForUser: mockListForUser,
    findById: mockFindById,
    findMembership: mockFindMembership,
    listMembers: mockListMembers,
    addMember: mockAddMember,
    removeMember: mockRemoveMember,
    countOwners: mockCountOwners,
    deleteTeam: mockDeleteTeam,
    updateName: mockUpdateName,
  },
  assetRepository: {},
}))

// AuthUserRepository is instantiated at module level in teamController.ts
vi.mock('../../repositories/authUserRepository', () => ({
  AuthUserRepository: vi.fn(function () {
    return { findByEmail: mockFindByEmail }
  }),
}))

import {
  createTeam,
  listTeams,
  listMembers,
  addMember,
  removeMember,
  deleteTeam,
  updateTeam,
} from '../../controllers/teamController'
import { MESSAGES } from '../../constants'

describe('teamController', () => {
  const mockNext = vi.fn()
  // mockUser acts as the currently authenticated owner across most test cases.
  const mockUser = { userId: 'owner-123', email: 'owner@example.com' }

  // Builds a chainable mock response (res.status(x).json(y) pattern).
  function makeRes() {
    const res = {
      status: vi.fn(),
      json: vi.fn(),
    }
    res.status.mockReturnValue(res)
    res.json.mockReturnValue(res)
    return res as any
  }

  beforeEach(() => {
    // Reset call history between tests to prevent assertion bleed-through.
    vi.clearAllMocks()
  })

  // createTeam
  describe('createTeam', () => {
    it('returns 400 when name is missing', async () => {
      const req = { body: {}, user: mockUser } as any
      const res = makeRes()
      await createTeam(req, res, mockNext)
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        message: MESSAGES.TEAM_NAME_REQUIRED_MSG,
      })
    })

    it('returns 400 when name is only whitespace', async () => {
      // The controller calls name.trim() before saving, so blank names must be rejected.
      const req = { body: { name: '   ' }, user: mockUser } as any
      const res = makeRes()
      await createTeam(req, res, mockNext)
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        message: MESSAGES.TEAM_NAME_REQUIRED_MSG,
      })
    })

    it('creates the team and returns 201 with the new team', async () => {
      const team = { id: 't1', name: 'Design', ownerId: mockUser.userId }
      mockCreateTeam.mockResolvedValue(team)
      const req = { body: { name: 'Design' }, user: mockUser } as any
      const res = makeRes()
      await createTeam(req, res, mockNext)
      // Confirm the trimmed name and the logged-in user's id are forwarded to the repository.
      expect(mockCreateTeam).toHaveBeenCalledWith('Design', mockUser.userId)
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith(team)
    })

    it('calls next when the repository throws', async () => {
      mockCreateTeam.mockRejectedValue(new Error('DB error'))
      const req = { body: { name: 'Design' }, user: mockUser } as any
      await createTeam(req, makeRes(), mockNext)
      expect(mockNext).toHaveBeenCalledOnce()
    })
  })

  // listTeams
  describe('listTeams', () => {
    it('returns all teams the user belongs to', async () => {
      const teams = [
        { id: 't1', name: 'Design' },
        { id: 't2', name: 'Backend' },
      ]
      mockListForUser.mockResolvedValue(teams)
      const req = { user: mockUser } as any
      const res = makeRes()
      await listTeams(req, res, mockNext)
      expect(mockListForUser).toHaveBeenCalledWith(mockUser.userId)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(teams)
    })

    it('calls next when the repository throws', async () => {
      mockListForUser.mockRejectedValue(new Error('DB error'))
      await listTeams({ user: mockUser } as any, makeRes(), mockNext)
      expect(mockNext).toHaveBeenCalledOnce()
    })
  })

  // listMembers
  describe('listMembers', () => {
    it('returns 404 when the team does not exist', async () => {
      mockFindById.mockResolvedValue(null)
      const req = { params: { id: 'missing-team' }, user: mockUser } as any
      const res = makeRes()
      await listMembers(req, res, mockNext)
      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({
        message: MESSAGES.TEAM_NOT_FOUND_MSG,
      })
    })

    it('returns 403 when the requester is not a team member', async () => {
      // Non-members must not be able to discover who else is in a team.
      mockFindById.mockResolvedValue({ id: 't1', name: 'Design' })
      mockFindMembership.mockResolvedValue(null)
      const req = { params: { id: 't1' }, user: mockUser } as any
      const res = makeRes()
      await listMembers(req, res, mockNext)
      expect(res.status).toHaveBeenCalledWith(403)
      expect(res.json).toHaveBeenCalledWith({
        message: MESSAGES.TEAM_NOT_A_MEMBER_MSG,
      })
    })

    it('returns 200 with the member list for a valid member', async () => {
      const members = [{ userId: mockUser.userId, role: 'owner' }]
      mockFindById.mockResolvedValue({ id: 't1' })
      mockFindMembership.mockResolvedValue({ role: 'member' })
      mockListMembers.mockResolvedValue(members)
      const req = { params: { id: 't1' }, user: mockUser } as any
      const res = makeRes()
      await listMembers(req, res, mockNext)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(members)
    })
  })

  // addMember
  describe('addMember', () => {
    it('returns 400 when email is missing', async () => {
      const req = { params: { id: 't1' }, body: {}, user: mockUser } as any
      const res = makeRes()
      await addMember(req, res, mockNext)
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        message: MESSAGES.EMAIL_REQUIRED_MSG,
      })
    })

    it('returns 404 when the team does not exist', async () => {
      mockFindById.mockResolvedValue(null)
      const req = {
        params: { id: 'ghost' },
        body: { email: 'new@example.com' },
        user: mockUser,
      } as any
      const res = makeRes()
      await addMember(req, res, mockNext)
      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({
        message: MESSAGES.TEAM_NOT_FOUND_MSG,
      })
    })

    it('returns 403 when the requester is not an owner', async () => {
      // Only owners are allowed to add new members.
      mockFindById.mockResolvedValue({ id: 't1' })
      mockFindMembership.mockResolvedValue({ role: 'member' })
      const req = {
        params: { id: 't1' },
        body: { email: 'new@example.com' },
        user: mockUser,
      } as any
      const res = makeRes()
      await addMember(req, res, mockNext)
      expect(res.status).toHaveBeenCalledWith(403)
      expect(res.json).toHaveBeenCalledWith({
        message: MESSAGES.TEAM_OWNER_ONLY_MSG,
      })
    })

    it('returns 404 when no account exists for the given email', async () => {
      mockFindById.mockResolvedValue({ id: 't1' })
      // First call: requester ownership check (passes). Second call (findMembership for target) not reached.
      mockFindMembership.mockResolvedValueOnce({ role: 'owner' })
      mockFindByEmail.mockResolvedValue(null)
      const req = {
        params: { id: 't1' },
        body: { email: 'ghost@example.com' },
        user: mockUser,
      } as any
      const res = makeRes()
      await addMember(req, res, mockNext)
      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({
        message: MESSAGES.USER_NOT_FOUND_MSG,
      })
    })

    it('returns 409 when the user is already a member', async () => {
      mockFindById.mockResolvedValue({ id: 't1' })
      mockFindMembership
        .mockResolvedValueOnce({ role: 'owner' }) // requester ownership check
        .mockResolvedValueOnce({ role: 'member' }) // target is already a member
      mockFindByEmail.mockResolvedValue({ id: 'u2', email: 'new@example.com' })
      const req = {
        params: { id: 't1' },
        body: { email: 'new@example.com' },
        user: mockUser,
      } as any
      const res = makeRes()
      await addMember(req, res, mockNext)
      expect(res.status).toHaveBeenCalledWith(409)
      expect(res.json).toHaveBeenCalledWith({
        message: MESSAGES.TEAM_MEMBER_ALREADY_EXISTS_MSG,
      })
    })

    it('adds the member and returns 201 on success', async () => {
      const newMember = {
        id: 'tm1',
        teamId: 't1',
        userId: 'u2',
        role: 'member',
      }
      mockFindById.mockResolvedValue({ id: 't1' })
      mockFindMembership
        .mockResolvedValueOnce({ role: 'owner' }) // requester
        .mockResolvedValueOnce(null) // target is not yet a member
      mockFindByEmail.mockResolvedValue({ id: 'u2', email: 'new@example.com' })
      mockAddMember.mockResolvedValue(newMember)
      const req = {
        params: { id: 't1' },
        body: { email: 'new@example.com' },
        user: mockUser,
      } as any
      const res = makeRes()
      await addMember(req, res, mockNext)
      expect(mockAddMember).toHaveBeenCalledWith('t1', 'u2')
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith(newMember)
    })
  })

  // removeMember
  describe('removeMember', () => {
    it('returns 404 when the team does not exist', async () => {
      mockFindById.mockResolvedValue(null)
      const req = {
        params: { id: 'ghost', userId: 'u2' },
        user: mockUser,
      } as any
      const res = makeRes()
      await removeMember(req, res, mockNext)
      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({
        message: MESSAGES.TEAM_NOT_FOUND_MSG,
      })
    })

    it('returns 403 when the requester is not an owner', async () => {
      mockFindById.mockResolvedValue({ id: 't1' })
      mockFindMembership.mockResolvedValueOnce({ role: 'member' })
      const req = { params: { id: 't1', userId: 'u2' }, user: mockUser } as any
      const res = makeRes()
      await removeMember(req, res, mockNext)
      expect(res.status).toHaveBeenCalledWith(403)
    })

    it('returns 404 when the target user is not a member', async () => {
      mockFindById.mockResolvedValue({ id: 't1' })
      mockFindMembership
        .mockResolvedValueOnce({ role: 'owner' }) // requester passes
        .mockResolvedValueOnce(null) // target membership not found
      const req = { params: { id: 't1', userId: 'u2' }, user: mockUser } as any
      const res = makeRes()
      await removeMember(req, res, mockNext)
      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({
        message: MESSAGES.TEAM_MEMBER_NOT_FOUND_MSG,
      })
    })

    it('returns 400 when removing the last owner of a team', async () => {
      // Removing the sole owner would leave the team permanently unmanageable.
      mockFindById.mockResolvedValue({ id: 't1' })
      mockFindMembership
        .mockResolvedValueOnce({ role: 'owner' }) // requester
        .mockResolvedValueOnce({ role: 'owner' }) // target is also owner
      mockCountOwners.mockResolvedValue(1) // only one owner exists
      const req = {
        params: { id: 't1', userId: mockUser.userId },
        user: mockUser,
      } as any
      const res = makeRes()
      await removeMember(req, res, mockNext)
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        message: MESSAGES.TEAM_LAST_OWNER_MSG,
      })
    })

    it('removes the member and returns 200 on success', async () => {
      mockFindById.mockResolvedValue({ id: 't1' })
      mockFindMembership
        .mockResolvedValueOnce({ role: 'owner' }) // requester
        .mockResolvedValueOnce({ role: 'member' }) // target is a regular member — countOwners skipped
      mockRemoveMember.mockResolvedValue(undefined)
      const req = { params: { id: 't1', userId: 'u2' }, user: mockUser } as any
      const res = makeRes()
      await removeMember(req, res, mockNext)
      expect(mockRemoveMember).toHaveBeenCalledWith('t1', 'u2')
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: MESSAGES.TEAM_MEMBER_REMOVE_SUCCESS_MSG,
      })
    })
  })

  // deleteTeam
  describe('deleteTeam', () => {
    it('returns 404 when the team does not exist', async () => {
      mockFindById.mockResolvedValue(null)
      const req = { params: { id: 'ghost' }, user: mockUser } as any
      const res = makeRes()
      await deleteTeam(req, res, mockNext)
      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({
        message: MESSAGES.TEAM_NOT_FOUND_MSG,
      })
    })

    it('returns 403 when the requester is not an owner', async () => {
      mockFindById.mockResolvedValue({ id: 't1' })
      mockFindMembership.mockResolvedValue({ role: 'member' })
      const req = { params: { id: 't1' }, user: mockUser } as any
      const res = makeRes()
      await deleteTeam(req, res, mockNext)
      expect(res.status).toHaveBeenCalledWith(403)
      expect(res.json).toHaveBeenCalledWith({
        message: MESSAGES.TEAM_OWNER_ONLY_MSG,
      })
    })

    it('deletes the team and returns 200 on success', async () => {
      mockFindById.mockResolvedValue({ id: 't1' })
      mockFindMembership.mockResolvedValue({ role: 'owner' })
      mockDeleteTeam.mockResolvedValue(undefined)
      const req = { params: { id: 't1' }, user: mockUser } as any
      const res = makeRes()
      await deleteTeam(req, res, mockNext)
      expect(mockDeleteTeam).toHaveBeenCalledWith('t1')
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: MESSAGES.TEAM_DELETE_SUCCESS_MSG,
      })
    })

    it('calls next when the repository throws', async () => {
      mockFindById.mockRejectedValue(new Error('DB error'))
      const req = { params: { id: 't1' }, user: mockUser } as any
      await deleteTeam(req, makeRes(), mockNext)
      expect(mockNext).toHaveBeenCalledOnce()
    })
  })

  // updateTeam
  describe('updateTeam', () => {
    it('returns 400 when the new name is missing', async () => {
      const req = { params: { id: 't1' }, body: {}, user: mockUser } as any
      const res = makeRes()
      await updateTeam(req, res, mockNext)
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        message: MESSAGES.TEAM_NAME_REQUIRED_MSG,
      })
    })

    it('returns 404 when the team does not exist', async () => {
      mockFindById.mockResolvedValue(null)
      const req = {
        params: { id: 'ghost' },
        body: { name: 'New Name' },
        user: mockUser,
      } as any
      const res = makeRes()
      await updateTeam(req, res, mockNext)
      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({
        message: MESSAGES.TEAM_NOT_FOUND_MSG,
      })
    })

    it('returns 403 when the requester is not an owner', async () => {
      mockFindById.mockResolvedValue({ id: 't1' })
      mockFindMembership.mockResolvedValue({ role: 'member' })
      const req = {
        params: { id: 't1' },
        body: { name: 'New Name' },
        user: mockUser,
      } as any
      const res = makeRes()
      await updateTeam(req, res, mockNext)
      expect(res.status).toHaveBeenCalledWith(403)
      expect(res.json).toHaveBeenCalledWith({
        message: MESSAGES.TEAM_OWNER_ONLY_MSG,
      })
    })

    it('renames the team and returns 200 with the updated team', async () => {
      const updated = { id: 't1', name: 'New Name' }
      mockFindById.mockResolvedValue({ id: 't1' })
      mockFindMembership.mockResolvedValue({ role: 'owner' })
      mockUpdateName.mockResolvedValue(updated)
      const req = {
        params: { id: 't1' },
        body: { name: 'New Name' },
        user: mockUser,
      } as any
      const res = makeRes()
      await updateTeam(req, res, mockNext)
      // Confirm the repository receives the trimmed name, not the raw body value.
      expect(mockUpdateName).toHaveBeenCalledWith('t1', 'New Name')
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(updated)
    })

    it('calls next when the repository throws', async () => {
      mockFindById.mockRejectedValue(new Error('DB error'))
      const req = {
        params: { id: 't1' },
        body: { name: 'New Name' },
        user: mockUser,
      } as any
      await updateTeam(req, makeRes(), mockNext)
      expect(mockNext).toHaveBeenCalledOnce()
    })
  })
})
