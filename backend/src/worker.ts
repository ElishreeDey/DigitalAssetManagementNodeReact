/*
 ****************************************************************************************************************************
 * Filename    : worker
 * Description : Standalone entry point for the Worker service — runs as a separate process/container from the
 *               API so it can be scaled independently (docker service scale worker=N) based on RabbitMQ queue
 *               depth. Does not start an HTTP server; only connects to the DB and begins consuming jobs.
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
