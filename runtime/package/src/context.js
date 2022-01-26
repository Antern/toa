'use strict'

const { resolve } = require('node:path')
const { yaml } = require('@toa.io/gears')

const { validate } = require('./context/validate')
const { find } = require('./manifest')
const { connectors } = require('./context/connectors')
const { extensions } = require('./context/extensions')
const { normalize } = require('./context/normalize')

const context = async (root) => {
  const path = resolve(root, CONTEXT)
  const context = await yaml(path)
  const roots = resolve(root, context.packages)

  normalize(context)
  validate(context)

  context.components = await find(roots)
  context.connectors = connectors(context)
  context.extensions = extensions(context)

  return context
}

const CONTEXT = 'context.toa.yaml'

exports.context = context
