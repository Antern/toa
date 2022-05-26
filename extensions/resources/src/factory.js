'use strict'

const { Locator } = require('@toa.io/core')
const { remap } = require('@toa.io/gears')

const { Connector } = require('./connector')
const { Resources } = require('./resources')
const { Server } = require('./server')
const { Remote } = require('./remote')
const { Tree } = require('./tree')
const { Query, constraints } = require('./query')

/**
 * @implements {toa.core.extensions.Factory}
 */
class Factory {
  #boot

  constructor (boot) {
    this.#boot = boot
  }

  connector (locator, definition) {
    const broadcast = this.#boot.bindings.broadcast(BINDING, 'resources', locator.id)

    return new Connector(broadcast, locator, definition)
  }

  service (name) {
    if (name === 'gateway') return this.#gateway()
  }

  #gateway () {
    const server = new Server()
    const broadcast = this.#boot.bindings.broadcast(BINDING, 'resources')

    const remote = async (domain, name, definition) => {
      const locator = new Locator({ domain, name })
      const remote = await this.#boot.remote(locator)

      const tree = new Tree(definition, (node) => {
        const query = Query.merge(node)
        const properties = remap(query, (value, key) => new constraints[key](value))

        return new Query(properties)
      })

      return new Remote(server, remote, tree)
    }

    const gateway = new Resources(broadcast, remote)

    gateway.depends(server)

    return gateway
  }
}

const BINDING = '@toa.io/bindings.amqp'

exports.Factory = Factory
