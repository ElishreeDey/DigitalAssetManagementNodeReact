/*
 ****************************************************************************************************************************
 * Filename    : useTeams
 * Description : Team list and team membership data hook.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-25
 ****************************************************************************************************************************
 */

import { useState, useEffect, useCallback } from 'react'
import { teamService } from '../services'
import { TEAM_TOAST } from '../constants'
import type { Team, TeamMember } from '../types'

export function useTeams() {
  //"useState" is Top-level React hook to initialize a state and tell React to track it.
  //e.g: here teams is 'state variable name' and setTeams is function. setTeams function called and get updated value
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [members, setMembers] = useState<Record<string, TeamMember[]>>({})

  //useCallback React hook - reusable team-loading function that is called automatically when the Teams page opens and can also be called manually later (via refresh).
  const fetchTeams = useCallback(async () => {
    try {
      const data = await teamService.list()
      setTeams(data)
      setError(null)
    } catch {
      setError(TEAM_TOAST.TEAMS_LOAD_FAILED)
    } finally {
      setIsLoading(false) // after loading done make it false so it will not go to infinite-loop
    }
  }, [])

  // useEffect hook runs automatically and fetchTeams
  useEffect(() => {
    void fetchTeams()
  }, [fetchTeams])

  //create team
  async function createTeam(name: string): Promise<void> {
    const team = await teamService.create(name)
    setTeams((prev) => [team, ...prev])
  }

  //update Team Name
  async function updateTeam(teamId: string, name: string): Promise<void> {
    const updated = await teamService.update(teamId, name)
    setTeams((prev) => prev.map((t) => (t.id === teamId ? updated : t)))
  }

  //remove team
  async function removeTeam(teamId: string): Promise<void> {
    await teamService.remove(teamId)
    setTeams((prev) => prev.filter((t) => t.id !== teamId))
  }

  //featch Team members
  async function fetchMembers(teamId: string): Promise<void> {
    const data = await teamService.listMembers(teamId)
    setMembers((prev) => ({ ...prev, [teamId]: data }))
  }

  // add member to team
  async function addMember(teamId: string, email: string): Promise<void> {
    await teamService.addMember(teamId, email)
    await fetchMembers(teamId) // refetch so the new member's email is populated
  }

  // remove member from team
  async function removeMember(teamId: string, userId: string): Promise<void> {
    await teamService.removeMember(teamId, userId)
    setMembers((prev) => ({
      ...prev,
      [teamId]: (prev[teamId] ?? []).filter((m) => m.userId !== userId),
    }))
  }

  // the custom hook - "useTeams" main function return these values.
  return {
    teams,
    isLoading,
    error,
    members,
    createTeam,
    updateTeam,
    removeTeam,
    fetchMembers,
    addMember,
    removeMember,
  }
}
