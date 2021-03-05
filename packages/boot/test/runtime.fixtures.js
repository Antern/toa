'use strict'

const { Connector } = jest.requireActual('@kookaburra/runtime')

const randomstring = require('randomstring')

const dirs = {
  stateless: 'stateless',
  stateful: 'stateful'
}

const connector = (name) => {
  const c = Object.create(Connector.prototype)
  Object.assign(c, { name, bind: jest.fn(), depends: jest.fn() })

  return c
}

const components = {
  default: {
    locator: {
      forename: randomstring.generate(),
      domain: randomstring.generate()
    },
    operations: [
      {
        name: 'get',
        target: 'object'
      },
      {
        name: 'add',
        target: 'collection',
        input: {
          schema: {
            properties: {
              foo: {
                type: 'string'
              }
            }
          }
        }
      }
    ]
  },
  stateless: {},
  stateful: {
    state: {
      storage: 'mongodb',
      schema: {
        properties: {
          [randomstring.generate()]: {
            type: 'string'
          }
        }
      }
    }
  }
}

class Storage extends Connector {}

const mock = {
  '@kookaburra/runtime': {
    Locator: jest.fn().mockImplementation(() => ({})),
    Runtime: jest.fn().mockImplementation(() => connector(randomstring.generate())),
    entity: {
      Factory: jest.fn().mockImplementation(() => ({ [randomstring.generate()]: randomstring.generate() }))
    },
    state: {
      Object: jest.fn().mockImplementation(() => ({ [randomstring.generate()]: randomstring.generate() })),
      Collection: jest.fn().mockImplementation(() => ({ [randomstring.generate()]: randomstring.generate() }))
    },
    Operation: jest.fn().mockImplementation(() => ({ [randomstring.generate()]: randomstring.generate() })),
    Invocation: jest.fn().mockImplementation(() => ({ [randomstring.generate()]: randomstring.generate() })),
    Schema: jest.fn().mockImplementation((schema) => ({ schema })),
    Connector
  },
  '@kookaburra/package': {
    Package: {
      load: jest.fn((dir) => ({ ...components.default, ...components[dir] }))
    }
  },
  '@kookaburra/storage-mongodb': {
    Storage
  }
}

exports.dirs = dirs
exports.components = components
exports.mock = mock
