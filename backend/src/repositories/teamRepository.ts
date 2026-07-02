/*
 ****************************************************************************************************************************
 * Filename    : teamRepository
 * Description : All direct database calls for teams and team membership — no business logic lives here.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-24
 ****************************************************************************************************************************
 */

import sequelize from '../config' //use the same single sequelize instance defined already in config
import { Team, TeamMember, AuthUser, AssetShare } from '../models'
import type { TeamMemberRole } from '../types'

export class TeamRepository {
  // Creates the team and adds its creator as the first member with role 'owner'
  async createTeam(name: string, createdBy: string): Promise<Team> {
    return sequelize.transaction(async (tx) => {
      const team = await Team.create({ name, createdBy }, { transaction: tx })
      await TeamMember.create(
        { teamId: team.id, userId: createdBy, role: 'owner' },
        { transaction: tx }
      )
      return team
    })
  }

  //get one team by its teamID
  async findById(id: string): Promise<Team | null> {
    return Team.findByPk(id) //Team class is a Sequelize Model we defined in teamModels.ts "teams" table, and it calls a predefined Sequelize method 'findByPk'.
  }

  // update Team Name
  async updateName(teamId: string, name: string): Promise<Team | null> {
    const team = await Team.findByPk(teamId)
    if (!team) return null
    team.name = name
    await team.save()
    return team
  }

  // For cur UserID it will tell Teams the current user belongs to.
  async listForUser(userId: string): Promise<Team[]> {
    const memberships = await TeamMember.findAll({ where: { userId } })
    const teamIds = memberships.map((m) => m.teamId)
    if (!teamIds.length) return []
    return Team.findAll({ where: { id: teamIds } })
  }

  //Its for TeamMember middle join table get one rec.
  async findMembership(
    teamId: string,
    userId: string
  ): Promise<TeamMember | null> {
    return TeamMember.findOne({ where: { teamId, userId } })
  }

  // Members of a team along with their email, for display in the UI.
  async listMembers(teamId: string): Promise<TeamMember[]> {
    return TeamMember.findAll({
      where: { teamId },
      include: [{ model: AuthUser, as: 'user', attributes: ['id', 'email'] }],
    })
  }

  //add member to team
  async addMember(
    teamId: string,
    userId: string,
    role: TeamMemberRole = 'member'
  ): Promise<TeamMember> {
    return TeamMember.create({ teamId, userId, role })
  }

  //remove member to team
  async removeMember(teamId: string, userId: string): Promise<boolean> {
    const deleted = await TeamMember.destroy({ where: { teamId, userId } })
    return deleted > 0
  }

  // get count of how many team owners
  async countOwners(teamId: string): Promise<number> {
    return TeamMember.count({ where: { teamId, role: 'owner' } })
  }

  // Deletes the team along with every related TeamMember join table and AssetShare join tables data.
  async deleteTeam(teamId: string): Promise<void> {
    await sequelize.transaction(async (tx) => {
      await AssetShare.destroy({ where: { teamId }, transaction: tx })
      await TeamMember.destroy({ where: { teamId }, transaction: tx })
      await Team.destroy({ where: { id: teamId }, transaction: tx })
    })
  }
}

export const teamRepository = new TeamRepository()
