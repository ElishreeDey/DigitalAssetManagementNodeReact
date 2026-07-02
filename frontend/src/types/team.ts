/*
 ****************************************************************************************************************************
 * Filename    : team
 * Description : TypeScript types for the team management feature — teams and team membership.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-25
 ****************************************************************************************************************************
 */

export type TeamMemberRole = 'owner' | 'member'

export type Team = {
  id: string
  name: string
  createdBy: string
  createdAt: string
}

export type TeamMember = {
  id: string
  teamId: string
  userId: string
  role: TeamMemberRole
  createdAt: string
  user?: { id: string; email: string }
}
