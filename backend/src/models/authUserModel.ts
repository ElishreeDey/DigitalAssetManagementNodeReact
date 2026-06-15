/*
 ****************************************************************************************************************************
 * Filename    : authUserModel
 * Description : Sequelize model for the 'auth_users' table — stores DAM system login credentials and role.
 *               Intentionally separate from the 'users' CRUD table so auth concerns stay isolated.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-12
 ****************************************************************************************************************************
 */

import { Model, DataTypes } from 'sequelize'
import sequelize from '../config/db'
import type { UserRole } from '../types/authTypes'

export class AuthUser extends Model {
  declare id: string
  declare email: string
  declare passwordHash: string // bcrypt hash — never the plain-text password
  declare role: UserRole
}

AuthUser.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4, // auto-generated so callers never supply an id
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true }, // Sequelize-level guard before the value reaches the DB
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'editor', 'viewer'),
      allowNull: false,
      defaultValue: 'viewer', // new accounts get the least-privileged role
    },
  },
  {
    sequelize,
    modelName: 'AuthUser',
    tableName: 'auth_users',
    timestamps: true, // adds createdAt / updatedAt columns automatically
  }
)

export default AuthUser
