'use strict'

const { entities, schemes, state: { Object, Collection }, Connector } = require('@kookaburra/runtime')

const state = (state) => {
  if (state === undefined) { return { connector: undefined, operations: (algorithm) => ({ algorithm }) } }

  const connector = storage(state.storage)
  const validator = new schemes.Validator()

  validator.add(state.schema)

  const schema = new schemes.Schema(state.schema.$id, validator)
  const entity = new entities.Factory(schema)

  const operations = (algorithm) => {
    let target

    if (algorithm.target === 'object') { target = new Object(connector, entity) }
    if (algorithm.target === 'collection') { target = new Collection(connector, entity) }

    if (!target) { throw new Error(`Unresolved target type '${algorithm.target}'`) }

    return { algorithm, target }
  }

  return { connector, operations }
}

const storage = (name) => {
  if (!name) name = DEFAULT_STORAGE

  const path = ['@kookaburra/storage-', ''].reduce(prefix =>
    require.resolve(`${prefix}${name}`, REQUIRE_OPTIONS))

  if (!path) { throw new Error(`Unresolved storage connector '${name}'`) }

  const { Storage } = require(path, REQUIRE_OPTIONS)

  if (!Storage) { throw new Error(`Module '${path}' does not export Storage class`) }
  if (!(Storage.prototype instanceof Connector)) { throw new Error(`Storage '${name}' is not instance of Connector`) }

  return new Storage()
}

const DEFAULT_STORAGE = 'mongodb'
const REQUIRE_OPTIONS = { paths: [process.cwd()] }

if (process.env.NODE_ENV === 'test') { REQUIRE_OPTIONS.paths.push(__dirname) }

exports.state = state
