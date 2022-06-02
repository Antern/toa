'use strict'

const { Connector } = require('@toa.io/core')

class Receiver extends Connector {
  #receiver

  constructor (receiver) {
    super()

    this.#receiver = receiver
  }

  condition = async (...args) => this.#receiver.condition(...args)
  request = async (...args) => this.#receiver.request(...args)
}

exports.Receiver = Receiver
