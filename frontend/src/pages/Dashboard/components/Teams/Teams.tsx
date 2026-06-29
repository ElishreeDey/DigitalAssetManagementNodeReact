/*
 ****************************************************************************************************************************
 * Filename    : Teams
 * Description : Team management — create teams, view members, add/remove members by email.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-25
 ****************************************************************************************************************************
 */

import { useState, useEffect, type SyntheticEvent } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useTeams } from '../../../../hooks'
import { authService } from '../../../../services'
import { trashIcon, arrowUpIcon, arrowDownIcon } from '../../../../assets'
import { TEAM_TOAST } from '../../../../constants'
import type { Account } from '../../../../types'
import './Teams.css'

type Props = {
  currentUserId: string | undefined
}

function getErrorMessage(err: unknown, fallback: string): string {
  return axios.isAxiosError(err) && err.response?.data?.message
    ? (err.response.data.message as string)
    : fallback
}

export default function Teams({ currentUserId }: Props) {
  const {
    teams,
    isLoading,
    error,
    members,
    createTeam,
    removeTeam,
    fetchMembers,
    addMember,
    removeMember,
  } = useTeams()

  const [newTeamName, setNewTeamName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null)
  const [memberEmail, setMemberEmail] = useState('')
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [accounts, setAccounts] = useState<Account[]>([])

  useEffect(() => {
    authService
      .listAccounts()
      .then(setAccounts)
      .catch(() => toast.error(TEAM_TOAST.ACCOUNTS_LOAD_FAILED))
  }, [])

  async function handleCreateTeam(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!newTeamName.trim()) return

    setIsCreating(true)
    try {
      await createTeam(newTeamName.trim())
      setNewTeamName('')
      toast.success(TEAM_TOAST.TEAM_CREATED)
    } catch (err) {
      toast.error(getErrorMessage(err, TEAM_TOAST.TEAM_CREATE_FAILED))
    } finally {
      setIsCreating(false)
    }
  }

  async function handleDeleteTeam(teamId: string) {
    try {
      await removeTeam(teamId)
      toast.success(TEAM_TOAST.TEAM_DELETED)
      if (expandedTeamId === teamId) setExpandedTeamId(null)
    } catch (err) {
      toast.error(getErrorMessage(err, TEAM_TOAST.TEAM_DELETE_FAILED))
    }
  }

  function handleToggleExpand(teamId: string) {
    const next = expandedTeamId === teamId ? null : teamId
    setExpandedTeamId(next)
    if (next && !members[teamId]) {
      void fetchMembers(teamId).catch(() =>
        toast.error(TEAM_TOAST.MEMBERS_LOAD_FAILED)
      )
    }
  }

  async function handleAddMember(
    e: SyntheticEvent<HTMLFormElement>,
    teamId: string
  ) {
    e.preventDefault()
    if (!memberEmail.trim()) return

    setIsAddingMember(true)
    try {
      await addMember(teamId, memberEmail.trim())
      setMemberEmail('')
      toast.success(TEAM_TOAST.MEMBER_ADDED)
    } catch (err) {
      toast.error(getErrorMessage(err, TEAM_TOAST.MEMBER_ADD_FAILED))
    } finally {
      setIsAddingMember(false)
    }
  }

  async function handleRemoveMember(teamId: string, userId: string) {
    try {
      await removeMember(teamId, userId)
      toast.success(TEAM_TOAST.MEMBER_REMOVED)
    } catch (err) {
      toast.error(getErrorMessage(err, TEAM_TOAST.MEMBER_REMOVE_FAILED))
    }
  }

  return (
    <div className="teams-page">
      <form className="team-create-form" onSubmit={handleCreateTeam}>
        <input
          type="text"
          placeholder="New team name…"
          className="team-create-input"
          value={newTeamName}
          onChange={(e) => setNewTeamName(e.target.value)}
        />
        <button type="submit" className="btn-primary" disabled={isCreating}>
          {isCreating ? 'Creating…' : 'Create Team'}
        </button>
      </form>

      {isLoading && <p className="teams-status">Loading teams…</p>}
      {error && <p className="teams-status teams-status--error">{error}</p>}
      {!isLoading && !error && teams.length === 0 && (
        <p className="teams-status">No teams yet — create your first team.</p>
      )}

      <div className="teams-list">
        {teams.map((team) => {
          const teamMembers = members[team.id] ?? []
          const myMembership = teamMembers.find(
            (m) => m.userId === currentUserId
          )
          const isOwner = myMembership?.role === 'owner'
          const isExpanded = expandedTeamId === team.id

          return (
            <div key={team.id} className="team-card">
              <div
                className="team-card-header"
                onClick={() => handleToggleExpand(team.id)}
              >
                <div>
                  <p className="team-card-name">{team.name}</p>
                  <p className="team-card-date">
                    Created {new Date(team.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="team-card-actions">
                  {isExpanded && isOwner && (
                    <button
                      type="button"
                      className="team-card-delete"
                      onClick={(e) => {
                        e.stopPropagation()
                        void handleDeleteTeam(team.id)
                      }}
                      aria-label="Delete team"
                    >
                      <img src={trashIcon} alt="" width={14} height={14} />
                    </button>
                  )}
                  <span className="team-card-down-arr">
                    <img
                      src={isExpanded ? arrowUpIcon : arrowDownIcon}
                      alt=""
                      width={12}
                      height={12}
                    />
                  </span>
                </div>
              </div>

              {isExpanded && (
                <div className="team-card-body">
                  <ul className="team-member-list">
                    {teamMembers.map((m) => (
                      <li key={m.id} className="team-member-row">
                        <span className="team-member-email">
                          {m.user?.email ?? m.userId}
                        </span>
                        <span className="team-member-role">{m.role}</span>
                        {isOwner && m.role !== 'owner' && (
                          <button
                            type="button"
                            className="btn-text"
                            onClick={() =>
                              void handleRemoveMember(team.id, m.userId)
                            }
                          >
                            Remove
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>

                  {isOwner &&
                    (() => {
                      const memberUserIds = new Set(
                        teamMembers.map((m) => m.userId)
                      )
                      const availableAccounts = accounts.filter(
                        (a) => !memberUserIds.has(a.id)
                      )

                      return (
                        <form
                          className="team-add-member-form"
                          onSubmit={(e) => handleAddMember(e, team.id)}
                        >
                          <select
                            className="team-add-member-input"
                            value={memberEmail}
                            onChange={(e) => setMemberEmail(e.target.value)}
                          >
                            <option value="">Select a user to add…</option>
                            {availableAccounts.map((account) => (
                              <option key={account.id} value={account.email}>
                                {account.email}
                              </option>
                            ))}
                          </select>
                          <button
                            type="submit"
                            className="btn-text"
                            disabled={isAddingMember || !memberEmail}
                          >
                            {isAddingMember ? 'Adding…' : 'Add'}
                          </button>
                        </form>
                      )
                    })()}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
