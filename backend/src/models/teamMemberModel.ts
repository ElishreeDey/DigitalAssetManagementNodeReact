/*
 ****************************************************************************************************************************
 * Filename    : teamMemberModel
 * Description : DB model for 'team_members' — join table mapping users to the teams they belong to.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-24
 ****************************************************************************************************************************
 */

import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize'

import sequelize from '../config'

import { Team } from './teamModel'
import { AuthUser } from './authUserModel'

import type { TeamMemberRole } from '../types'

export class TeamMember extends Model<
  InferAttributes<TeamMember>,
  InferCreationAttributes<TeamMember>
> {
  declare id: CreationOptional<string>
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  declare teamId: string
  declare userId: string

  // owner can manage members/shares,
  // member can only use the team's shares
  declare role: TeamMemberRole
}

// TeamMember table initialization.
TeamMember.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    teamId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Team,
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: AuthUser,
        key: 'id',
      },
    },
    role: {
      type: DataTypes.ENUM('owner', 'member'),
      allowNull: false,
      defaultValue: 'member',
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'TeamMember',
    tableName: 'team_members',
    timestamps: true,
    indexes: [
      // unique combination to prevent duplicate entry
      { fields: ['teamId', 'userId'], unique: true },
      { fields: ['userId'] },
    ],
  }
)
// One Team can have many TeamMembers.
Team.hasMany(TeamMember, { foreignKey: 'teamId', as: 'members' })
//A TeamMember row belongs to exactly one Team.
TeamMember.belongsTo(Team, { foreignKey: 'teamId', as: 'team' })

export default TeamMember
