/*
 ****************************************************************************************************************************
 * Filename    : authUserModel
 * Description : Sequelize model for authentication users.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-12
 ****************************************************************************************************************************
 */

import { Model, DataTypes } from 'sequelize'
import sequelize from '../config'

export class AuthUser extends Model {
  declare id: string
  declare email: string
  declare passwordHash: string
}

AuthUser.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'AuthUser',
    tableName: 'auth_users',
    timestamps: true,
  }
)

export default AuthUser
