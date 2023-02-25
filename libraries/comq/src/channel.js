'use strict'

/**
 * @typedef {import('amqplib').Channel | import('amqplib').ConfirmChannel} AMQPChannel
 */

const { EventEmitter } = require('node:events')
const { lazy, promex } = require('@toa.io/libraries/generic')

/**
 * @implements {comq.Channel}
 */
class Channel {
  /** @type {AMQPChannel} */
  #channel

  /** @type {string[]} */
  #tags = []

  /** @type {toa.generic.Promex} */
  #paused

  #diagnostics = new EventEmitter()

  /**
   * @param {AMQPChannel} channel
   */
  constructor (channel) {
    this.#channel = channel
  }

  consume = lazy(this, this.#assertQueue,
    /**
     * @param {string} queue
     * @param {boolean} durable
     * @param {comq.channels.consumer} callback
     * @returns {Promise<void>}
     */
    async (queue, durable, callback) => {
      await this.#consume(queue, callback)
    })

  async send (queue, buffer, properties) {
    const args = [queue, buffer]

    await this.#publish('sendToQueue', args, properties)
  }

  deliver = lazy(this, this.#assertPersistentQueue, this.send)

  subscribe = lazy(this,
    [this.#assertExchange, this.#bindQueue],
    /**
     * @param {string} exchange
     * @param {string} queue
     * @param {comq.channels.consumer} callback
     * @returns {Promise<void>}
     */
    async (exchange, queue, callback) => {
      await this.#consume(queue, callback)
    })

  publish = lazy(this, this.#assertExchange,
    /**
     * @param {string} exchange
     * @param {Buffer} buffer
     * @param {import('amqplib').Options.Publish} [properties]
     */
    async (exchange, buffer, properties) => {
      const args = [exchange, '', buffer]

      await this.#publish('publish', args, properties)
    })

  async seal () {
    const promises = this.#tags.map((tag) => this.#channel.cancel(tag))

    await Promise.all(promises)
  }

  diagnose (event, listener) {
    this.#diagnostics.on(event, listener)
  }

  // region initializers

  /**
   * @param {string} queue
   * @param {boolean} persistent
   * @returns {Promise<void>}
   */
  async #assertQueue (queue, persistent) {
    const options = persistent ? PERSISTENT_QUEUE : TRANSIENT_QUEUE

    await this.#channel.assertQueue(queue, options)
  }

  /**
   * @param {string} queue
   * @returns {Promise<void>}
   */
  async #assertPersistentQueue (queue) {
    return this.#assertQueue(queue, true)
  }

  /**
   * @param {string} exchange
   * @returns {Promise<void>}
   */
  async #assertExchange (exchange) {
    await this.#channel.assertExchange(exchange, 'fanout')
  }

  /**
   *
   * @param {string} exchange
   * @param {string} queue
   * @returns {Promise<void>}
   */
  async #bindQueue (exchange, queue) {
    await this.#assertPersistentQueue(queue)
    await this.#channel.bindQueue(queue, exchange, '')
  }

  // endregion

  /**
   * @param {string} method
   * @param {any[]} args
   * @param {import('amqplib').Options.Publish} properties
   */
  async #publish (method, args, properties) {
    properties ??= {}
    properties.persistent ??= true

    if (this.#paused !== undefined) await this.#paused

    const confirmation = promex()

    // it is reasonably expected that #publish is called on a ConfirmChannel
    // once this will be a problem, Channel class should be refactored into
    // abstract Channel and two inheritors: Input and Output to make sure
    // input channel does not have publication methods
    const resume = this.#channel[method](...args, properties, confirmation.callback)

    if (resume === false) this.#pause()

    return confirmation
  }

  /**
   * @param {string} queue
   * @param {comq.channels.consumer} callback
   * @returns {Promise<void>}
   */
  async #consume (queue, callback) {
    const consumer = this.#getAcknowledgingConsumer(callback)

    const response = await this.#channel.consume(queue, consumer)

    this.#tags.push(response.consumerTag)
  }

  /**
   * @param {comq.channels.consumer} consumer
   * @returns {comq.channels.consumer}
   */
  #getAcknowledgingConsumer = (consumer) =>
    async (message) => {
      await consumer(message)

      this.#channel.ack(message)
    }

  #pause () {
    if (this.#paused !== undefined) return

    this.#paused = promex()
    this.#channel.once('drain', () => this.#unpause())
    this.#diagnostics.emit('flow')
  }

  #unpause () {
    this.#paused.resolve()
    this.#paused = undefined
    this.#diagnostics.emit('drain')
  }
}

const HOUR = 3600 * 1000

/** @type {import('amqplib').Options.AssertQueue} */
const PERSISTENT_QUEUE = {}

/** @type {import('amqplib').Options.AssertQueue} */
const TRANSIENT_QUEUE = { expires: HOUR }

exports.Channel = Channel
