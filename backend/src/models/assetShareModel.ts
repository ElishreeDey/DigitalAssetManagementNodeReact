/*
 ****************************************************************************************************************************
 * Filename    : assetShareModel
 * Description : DB model for 'asset_shares' — grants access to an asset.
 *               An asset is realted to a team (scope='team') Or a single user (scope='user')
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

import { Asset } from './assetModel'
import { Team } from './teamModel'
import { AuthUser } from './authUserModel'

import type { ShareScope, SharePermission } from '../types'

// as its a join table it holds assetId, teamId and userId
export class AssetShare extends Model<
  InferAttributes<AssetShare>,
  InferCreationAttributes<AssetShare>
> {
  declare id: CreationOptional<string>
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  declare assetId: string
  declare scope: ShareScope
  declare teamId: string | null
  declare sharedWithUserId: string | null
  declare permission: SharePermission
  declare createdBy: string // userId of the asset owner who created the share
}

// TeamMember table initialization.
AssetShare.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    assetId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: Asset, key: 'id' },
    },
    scope: {
      type: DataTypes.ENUM('team', 'user'),
      allowNull: false,
    },
    teamId: {
      type: DataTypes.UUID,
      allowNull: true,
      defaultValue: null,
      references: { model: Team, key: 'id' },
    },
    sharedWithUserId: {
      type: DataTypes.UUID,
      allowNull: true,
      defaultValue: null,
      references: { model: AuthUser, key: 'id' },
    },
    permission: {
      type: DataTypes.ENUM('view', 'download'),
      allowNull: false,
      defaultValue: 'view',
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: AuthUser, key: 'id' },
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'AssetShare',
    tableName: 'asset_shares',
    timestamps: true,
    validate: {
      scopeMatchesTarget() {
        // If scope='team' must carry teamId only
        if (this.scope === 'team' && (!this.teamId || this.sharedWithUserId)) {
          throw new Error(
            "scope='team' requires teamId and no sharedWithUserId"
          )
        }
        // If scope='user' must carry sharedWithUserId only
        if (this.scope === 'user' && (!this.sharedWithUserId || this.teamId)) {
          throw new Error(
            "scope='user' requires sharedWithUserId and no teamId"
          )
        }
      },
    },
    indexes: [
      { fields: ['assetId'] },
      { fields: ['teamId'] },
      { fields: ['sharedWithUserId'] },

      {
        fields: ['assetId', 'teamId'],
        unique: true,
        where: { scope: 'team' },
      },

      {
        fields: ['assetId', 'sharedWithUserId'],
        unique: true,
        where: { scope: 'user' },
      },
    ],
  }
)

// One Asset can have many AssetShare records.
Asset.hasMany(AssetShare, { foreignKey: 'assetId', as: 'shares' })

//Each AssetShare belongs to exactly one Asset.
AssetShare.belongsTo(Asset, { foreignKey: 'assetId', as: 'asset' })

export default AssetShare
