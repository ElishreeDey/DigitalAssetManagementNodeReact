/*
 ****************************************************************************************************************************
 * Filename    : assetModel
 * Description : Sequelize model for the 'assets' table — stores metadata for every uploaded file.
 *               The actual file binary is never stored in the DB; only the MinIO bucket path is kept here.
 *               Uses UUID primary key.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-16
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
import type { AssetStatus, VideoRendition } from '../types'

export class Asset extends Model<
  InferAttributes<Asset>,
  InferCreationAttributes<Asset>
> {
  // CreationOptional means Sequelize generates these
  declare id: CreationOptional<string>
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  // File identity
  declare originalName: string // original filename the user uploaded
  declare storedName: string // UUID-based name used in MinIO (never the original)
  declare mimeType: string // e.g. 'image/jpeg', 'video/mp4'
  declare size: number // file size in bytes

  // Storage paths in MinIO
  declare bucketPath: string // path to the original file in MinIO
  declare thumbnailPath: string | null // path to the 400×400 thumbnail, null until worker runs

  // Enrichment — set by the worker after processing
  declare tags: string[] // auto-generated: category, type, size label, filename keywords
  declare width: number | null
  declare height: number | null
  declare renditions: CreationOptional<VideoRendition[]>

  // Lifecycle
  declare status: AssetStatus // pending → processing → ready | failed
  declare uploadedBy: string // userId of the authenticated user who uploaded
  declare downloadCount: CreationOptional<number> // incremented on each download request
}

Asset.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    originalName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    storedName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    bucketPath: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    thumbnailPath: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    width: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    height: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    renditions: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'ready', 'failed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    uploadedBy: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    downloadCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'Asset',
    tableName: 'assets',
    timestamps: true,
    indexes: [
      // indexing added as list uses uploadedBy and sorts by creation date.
      { fields: ['uploadedBy', 'createdAt'] },
    ],
  }
)

export default Asset
