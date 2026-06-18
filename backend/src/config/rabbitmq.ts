/*
 ****************************************************************************************************************************
 * Filename    : rabbitmq
 * Description : RabbitMQ channel configuration — maintains a single AMQP channel singleton shared by both
 *               the API (publisher) and the Worker (consumer).
 *               getRabbitChannel() connects on first call and returns the cached channel on every subsequent call.
 *               The channel resets to null on connection close/error so the next call transparently reconnects.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-16
 ****************************************************************************************************************************
 */

import amqplib from 'amqplib'
import { keys } from './keys'
import { MESSAGES, ASSET_QUEUE_NAME } from '../constants'

// Re-exported from constants so both the API and Worker import from config,
// keeping a single import path for queue-related config
export const ASSET_QUEUE = ASSET_QUEUE_NAME

// Module-level singleton — one channel is enough for all publish/consume operations
// in a single process; create a new channel per process, not per request
let _channel: amqplib.Channel | null = null

export async function getRabbitChannel(): Promise<amqplib.Channel> {
  if (_channel) return _channel

  const conn = await amqplib.connect(keys.rabbitmq.url)
  _channel = await conn.createChannel()

  // durable: true — queue definition survives a RabbitMQ broker restart.
  // Without this, the queue is wiped on restart and pending jobs are lost.
  await _channel.assertQueue(ASSET_QUEUE, { durable: true })

  // prefetch(1) — each worker processes one message at a time.
  // Without this, RabbitMQ pushes all queued messages to the first available worker,
  // leaving other worker instances idle until that worker finishes all of them.
  _channel.prefetch(1)

  // Reset the cached channel on disconnect so the next getRabbitChannel() call reconnects
  conn.on('close', () => {
    _channel = null
  })
  conn.on('error', (err: Error) => {
    console.error(
      `[RabbitMQ] ${MESSAGES.RABBITMQ_CONNECTION_ERROR_MSG}:`,
      err.message
    )
    _channel = null
  })

  console.log(`[RabbitMQ] ${MESSAGES.RABBITMQ_CONNECTED_MSG}: "${ASSET_QUEUE}"`)
  return _channel
}
