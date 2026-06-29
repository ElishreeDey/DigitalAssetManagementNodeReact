/*
 ****************************************************************************************************************************
 * Filename    : teams
 * Description : Team API endpoint helpers.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-25
 ****************************************************************************************************************************
 */

// This is simply a collection of every Team API endpoint used by the frontend.
export const TEAM_ENDPOINTS = {
  LIST: '/teams',
  byId: (teamId: string) => `/teams/${teamId}`,
  members: (teamId: string) => `/teams/${teamId}/members`,
  member: (teamId: string, userId: string) =>
    `/teams/${teamId}/members/${userId}`,
} as const

// All team toast success msg or err msg
export const TEAM_TOAST = {
  TEAMS_LOAD_FAILED: 'Failed to load teams',
  ACCOUNTS_LOAD_FAILED: 'Failed to load accounts',
  TEAM_CREATED: 'Team created',
  TEAM_CREATE_FAILED: 'Failed to create team',
  TEAM_DELETED: 'Team deleted',
  TEAM_DELETE_FAILED: 'Failed to delete team',
  MEMBERS_LOAD_FAILED: 'Failed to load members',
  MEMBER_ADDED: 'Member added',
  MEMBER_ADD_FAILED: 'Failed to add member',
  MEMBER_REMOVED: 'Member removed',
  MEMBER_REMOVE_FAILED: 'Failed to remove member',
} as const
