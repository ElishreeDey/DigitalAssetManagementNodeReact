/*
 ****************************************************************************************************************************
 * Filename    : teamTypes
 * Description : Type definitions for teams and team members.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-24
 ****************************************************************************************************************************
 */

export type TeamMemberRole = 'owner' | 'member'

export type ShareScope = 'team' | 'user'

export type SharePermission = 'view' | 'download'

export type TeamIdParams = { id: string } //team table

export type TeamMemberParams = { id: string; userId: string } //team member table

export type CreateTeamBody = { name: string }

export type AddTeamMemberBody = { email: string }
