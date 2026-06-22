/*
 ****************************************************************************************************************************
 * Filename    : worker
 * Description : Worker service entry point.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-17
 ****************************************************************************************************************************
 */

import sequelize from './config'
import { startAssetWorker } from './workers/assetWorker'

sequelize
  .sync()
  .then(() => startAssetWorker())
  .catch((err: unknown) => {
    console.error('[Worker] Failed to start:', (err as Error).message)
    process.exit(1)
  })

process.on('SIGTERM', () => process.exit(0))
process.on('SIGINT', () => process.exit(0))
