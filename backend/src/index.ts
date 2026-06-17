/*
 ****************************************************************************************************************************
 * Filename    : index
 * Description : Express application entry point — wires up middleware, routes, and starts the server after
 *               Sequelize syncs the database schema.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-12
 ****************************************************************************************************************************
 */

import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'

import sequelize, { keys, ensureBucket } from './config'
import router from './routes'
import { apiRateLimiter, errorMiddleware } from './middleware'
import {
  MESSAGES,
  JSON_BODY_LIMIT,
  CORS_METHODS,
  API_PREFIX,
} from './constants'

const app = express()

// helmet sets secure HTTP headers (X-Frame-Options, CSP, etc.) in one call.
app.use(helmet())

// credentials:true is required so the browser sends the httpOnly cookie cross-origin.
app.use(
  cors({ origin: keys.clientUrl, methods: CORS_METHODS, credentials: true })
)

app.use(cookieParser())

// Reject bodies larger than JSON_BODY_LIMIT before they reach any controller.
app.use(express.json({ limit: JSON_BODY_LIMIT }))

app.use(morgan('dev'))
app.use(apiRateLimiter)

app.use(API_PREFIX, router)

// errorMiddleware must be registered last so it catches errors from all routes.
app.use(errorMiddleware)

sequelize
  .sync()
  .then(async () => {
    console.log(MESSAGES.DB_CON_SUCCESS_MSG)

    // The API needs the bucket to exist before it can accept the first upload.
    // Failure here doesn't crash the API — MinIO may just not be up yet in local dev.
    await ensureBucket().catch((err: unknown) =>
      console.warn('[MinIO] Bucket init skipped:', (err as Error).message)
    )

    const server = app.listen(keys.port, () => {
      console.log(`${MESSAGES.SERVER_RUNNING_ONPORT_MSG} ${keys.port}`)
    })

    // Graceful shutdown: finish in-flight requests before closing the DB pool.
    const shutdown = () => {
      server.close(() => {
        void sequelize.close().then(() => process.exit(0))
      })
    }

    process.on('SIGTERM', shutdown)
    process.on('SIGINT', shutdown)
  })
  .catch(console.error)
