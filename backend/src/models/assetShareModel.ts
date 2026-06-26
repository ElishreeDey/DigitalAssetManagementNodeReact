/*
 ****************************************************************************************************************************
 * Filename    : assetShareModel
 * Description : DB model for 'asset_shares' — grants every member of a team access to an asset.
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

import type { SharePermission } from '../types'

// as its a join table it holds assetId and teamId
export class AssetShare extends Model<
  InferAttributes<AssetShare>,
  InferCreationAttributes<AssetShare>
> {
  declare id: CreationOptional<string>
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  declare assetId: string
  declare teamId: string
  declare permission: SharePermission
  declare createdBy: string // userId of the asset owner who created the share
}

// AssetShare table initialization.
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
    teamId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: Team, key: 'id' },
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
    indexes: [
      { fields: ['assetId'] },
      { fields: ['teamId'] },
      { fields: ['assetId', 'teamId'], unique: true },
    ],
  }
)

// One Asset can have many AssetShare records.
Asset.hasMany(AssetShare, { foreignKey: 'assetId', as: 'shares' })

//Each AssetShare belongs to exactly one Asset.
AssetShare.belongsTo(Asset, { foreignKey: 'assetId', as: 'asset' })

AssetShare.belongsTo(Team, { foreignKey: 'teamId', as: 'team' })

export default AssetShare
