'use strict'

const { Pointer: Base } = require('@toa.io/libraries/connectors')

// noinspection JSClosureCompilerSyntax
/**
 * @implements {toa.mongodb.Pointer}
 */
class Pointer extends Base {
  db
  collection

  /**
   * @param {toa.core.Locator} locator
   */
  constructor (locator) {
    super(locator, 'mongodb:', OPTIONS)

    this.db = locator.namespace
    this.collection = locator.name
  }
}

/** @type {toa.connectors.pointer.Options} */
const OPTIONS = { prefix: 'storages-mongodb' }

exports.Pointer = Pointer
