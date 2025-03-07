'use strict'

const { context: find } = require('../../util/find')
const { deployment: { Factory } } = require('@toa.io/operations')

/**
 * @param {{ path: string, target: string, environment?: string }} argv
 * @returns {Promise<void>}
 */
const dump = async (argv) => {
  const path = find(argv.path)
  const factory = await Factory.create(path, argv.environment)
  const operator = factory.operator()
  const target = await operator.export(argv.target)

  console.log(target)
}

exports.dump = dump
