'use strict'

const operations = [
  {
    algorithm: () => {},
    name: 'get',
    type: 'observation',
    query: { criteria: {} }
  }
]

const system = {
  properties: {
    id: {
      type: 'string'
    },
    _created: {
      type: 'integer',
      format: 'timestamp'
    },
    _updated: {
      type: 'integer',
      format: 'timestamp'
    },
    _deleted: {
      type: 'integer',
      format: 'timestamp'
    },
    _version: {
      type: 'integer',
      default: 0
    }
  },
  required: ['id', '_version']
}

exports.operations = operations
exports.system = system
