/*
 ****************************************************************************************************************************
 * Filename    : db
 * Description : Creates and exports the Sequelize instance that connects to PostgreSQL.
 *               All connection parameters come from keys.ts — no direct process.env reads here.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-12
 ****************************************************************************************************************************
 */

import { Sequelize } from 'sequelize'
import { keys } from './keys'

const sequelize = new Sequelize(keys.db.name, keys.db.user, keys.db.password, {
  host: keys.db.host,
  dialect: 'postgres',
  port: keys.db.port,
  logging: false, // disable SQL query logging in console; enable temporarily for debugging
  pool: {
    max: 5, // maximum simultaneous connections kept open
    min: 0, // allow the pool to shrink to zero when idle
    acquire: 30000, // ms to wait before throwing a "connection not acquired" error
    idle: 10000, // ms before an idle connection is released back to the pool
  },
})

export default sequelize
