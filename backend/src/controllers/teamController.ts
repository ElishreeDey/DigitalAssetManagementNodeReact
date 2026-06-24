/*
 ****************************************************************************************************************************
 * Filename    : teamController
 * Description : Team creation and team member's management.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-24
 ****************************************************************************************************************************
 */

import { Request, Response, NextFunction } from 'express'
import { teamRepository } from '../repositories'
import { AuthUserRepository } from '../repositories/authUserRepository'
import { MESSAGES } from '../constants'
import type {
  TeamIdParams,
  TeamMemberParams,
  CreateTeamBody,
  AddTeamMemberBody,
} from '../types'

const authUserRepository = new AuthUserRepository()

// Here Create a Team first only need to give Team name it will create a team for curLoggedInUser as owner.
// POST /teams
export const createTeam = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = req.body as CreateTeamBody

    if (!name?.trim()) {
      return res.status(400).json({ message: MESSAGES.TEAM_NAME_REQUIRED_MSG })
    }

    const team = await teamRepository.createTeam(name.trim(), req.user!.userId)
    res.status(201).json(team)
  } catch (error) {
    ;(error as Error).message = MESSAGES.TEAM_CREATE_FAILED_MSG
    next(error)
  }
}

// Here get All Team names
// GET /teams
export const listTeams = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const teams = await teamRepository.listForUser(req.user!.userId)
    res.status(200).json(teams)
  } catch (error) {
    ;(error as Error).message = MESSAGES.TEAM_FETCH_FAILED_MSG
    next(error)
  }
}

// Here Get all Members of current team
// GET /teams/:id/members
export const listMembers = async (
  req: Request<TeamIdParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: teamId } = req.params

    const team = await teamRepository.findById(teamId)
    if (!team) {
      return res.status(404).json({ message: MESSAGES.TEAM_NOT_FOUND_MSG })
    }

    // Only members of the team view its member list.
    const membership = await teamRepository.findMembership(
      teamId,
      req.user!.userId
    )
    if (!membership) {
      return res.status(403).json({ message: MESSAGES.TEAM_NOT_A_MEMBER_MSG })
    }

    const members = await teamRepository.listMembers(teamId)
    res.status(200).json(members)
  } catch (error) {
    ;(error as Error).message = MESSAGES.TEAM_MEMBERS_FETCH_FAILED_MSG
    next(error)
  }
}

// Here ADDMember to team
// POST /teams/:id/members
export const addMember = async (
  req: Request<TeamIdParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: teamId } = req.params
    const { email } = req.body as AddTeamMemberBody

    if (!email?.trim()) {
      return res.status(400).json({ message: MESSAGES.EMAIL_REQUIRED_MSG })
    }

    const team = await teamRepository.findById(teamId)
    if (!team) {
      return res.status(404).json({ message: MESSAGES.TEAM_NOT_FOUND_MSG })
    }

    // Only an owner who has added this team can add new members.
    const requesterMembership = await teamRepository.findMembership(
      teamId,
      req.user!.userId
    )
    if (!requesterMembership || requesterMembership.role !== 'owner') {
      return res.status(403).json({ message: MESSAGES.TEAM_OWNER_ONLY_MSG })
    }

    const newMemberUser = await authUserRepository.findByEmail(
      email.trim().toLowerCase()
    )
    if (!newMemberUser) {
      return res.status(404).json({ message: MESSAGES.USER_NOT_FOUND_MSG })
    }

    const existingMembership = await teamRepository.findMembership(
      teamId,
      newMemberUser.id
    )
    if (existingMembership) {
      return res
        .status(409)
        .json({ message: MESSAGES.TEAM_MEMBER_ALREADY_EXISTS_MSG })
    }

    const member = await teamRepository.addMember(teamId, newMemberUser.id)
    res.status(201).json(member)
  } catch (error) {
    ;(error as Error).message = MESSAGES.TEAM_MEMBER_ADD_FAILED_MSG
    next(error)
  }
}

// Here Remove Member from team
// DELETE /teams/:id/members/:userId
export const removeMember = async (
  req: Request<TeamMemberParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: teamId, userId: targetUserId } = req.params

    const team = await teamRepository.findById(teamId)
    if (!team) {
      return res.status(404).json({ message: MESSAGES.TEAM_NOT_FOUND_MSG })
    }

    // Only an owner who has created team can remove members.
    const requesterMembership = await teamRepository.findMembership(
      teamId,
      req.user!.userId
    )
    if (!requesterMembership || requesterMembership.role !== 'owner') {
      return res.status(403).json({ message: MESSAGES.TEAM_OWNER_ONLY_MSG })
    }

    const targetMembership = await teamRepository.findMembership(
      teamId,
      targetUserId
    )
    if (!targetMembership) {
      return res
        .status(404)
        .json({ message: MESSAGES.TEAM_MEMBER_NOT_FOUND_MSG })
    }

    // A team must always have at least one owner who has created it.
    if (targetMembership.role === 'owner') {
      const ownerCount = await teamRepository.countOwners(teamId)
      if (ownerCount <= 1) {
        return res.status(400).json({ message: MESSAGES.TEAM_LAST_OWNER_MSG })
      }
    }

    await teamRepository.removeMember(teamId, targetUserId)
    res.status(200).json({ message: MESSAGES.TEAM_MEMBER_REMOVE_SUCCESS_MSG })
  } catch (error) {
    ;(error as Error).message = MESSAGES.TEAM_MEMBER_REMOVE_FAILED_MSG
    next(error)
  }
}

// Here Delete a team and all its members
// DELETE /teams/:id
export const deleteTeam = async (
  req: Request<TeamIdParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: teamId } = req.params

    const team = await teamRepository.findById(teamId)
    if (!team) {
      return res.status(404).json({ message: MESSAGES.TEAM_NOT_FOUND_MSG })
    }

    // Only an owner can delete the team.
    const requesterMembership = await teamRepository.findMembership(
      teamId,
      req.user!.userId
    )
    if (!requesterMembership || requesterMembership.role !== 'owner') {
      return res.status(403).json({ message: MESSAGES.TEAM_OWNER_ONLY_MSG })
    }

    await teamRepository.deleteTeam(teamId)
    res.status(200).json({ message: MESSAGES.TEAM_DELETE_SUCCESS_MSG })
  } catch (error) {
    ;(error as Error).message = MESSAGES.TEAM_DELETE_FAILED_MSG
    next(error)
  }
}
