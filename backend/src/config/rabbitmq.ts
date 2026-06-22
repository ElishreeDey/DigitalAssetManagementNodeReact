/*
 ****************************************************************************************************************************
 * Filename    : rabbitmq
 * Description : RabbitMQ channel configuration shared by API publishers and Worker consumers.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-16
 ****************************************************************************************************************************
 */

import amqplib from 'amqplib'
import { keys } from './keys'
import { MESSAGES, ASSET_QUEUE_NAME } from '../constants'

// keeping a single import path for queue-related config
export const ASSET_QUEUE = ASSET_QUEUE_NAME

// Singleton channel instance per process
let _channel: amqplib.Channel | null = null

export async function getRabbitChannel(): Promise<amqplib.Channel> {
  if (_channel) return _channel

  const conn = await amqplib.connect(keys.rabbitmq.url)
  _channel = await conn.createChannel()

  // Durable queue ensures pending messages survive broker restarts
  await _channel.assertQueue(ASSET_QUEUE, { durable: true })

  // Process one message at a time per worker instance
  _channel.prefetch(1)

  // Clear cached channel so future calls can reconnect
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
