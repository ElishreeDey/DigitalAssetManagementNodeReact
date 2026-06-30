/*
 ****************************************************************************************************************************
 * Filename    : teamService
 * Description : API calls for team management.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-25
 ****************************************************************************************************************************
 */

import api from './api'
import { TEAM_ENDPOINTS } from '../constants'
import type { Team, TeamMember } from '../types'

export const teamService = {
  //create a new team by giving Team name
  async create(name: string): Promise<Team> {
    const res = await api.post<Team>(TEAM_ENDPOINTS.LIST, { name })
    return res.data
  },

  //update team name
  async update(teamId: string, name: string): Promise<Team> {
    const res = await api.patch<Team>(TEAM_ENDPOINTS.byId(teamId), { name })
    return res.data
  },

  //remove existing team by teamId
  async remove(teamId: string): Promise<void> {
    await api.delete(TEAM_ENDPOINTS.byId(teamId))
  },

  //add a new member to team
  async addMember(teamId: string, email: string): Promise<TeamMember> {
    const res = await api.post<TeamMember>(TEAM_ENDPOINTS.members(teamId), {
      email,
    })
    return res.data
  },

  // remove a team member from a team.
  async removeMember(teamId: string, userId: string): Promise<void> {
    await api.delete(TEAM_ENDPOINTS.member(teamId, userId))
  },

  //get all team members for a team
  async listMembers(teamId: string): Promise<TeamMember[]> {
    const res = await api.get<TeamMember[]>(TEAM_ENDPOINTS.members(teamId))
    return res.data
  },

  //It returns all teams the currently logged-in user belongs to
  async list(): Promise<Team[]> {
    const res = await api.get<Team[]>(TEAM_ENDPOINTS.LIST)
    return res.data
  },
}
