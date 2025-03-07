'use strict'

const { merge } = require('@toa.io/generic')

const dereference = (manifest) => {
  // schemas
  const resolver = createResolver(manifest.entity?.schema?.properties)

  if (manifest.entity !== undefined)
    schema(manifest.entity.schema, resolver)

  if ('operations' in manifest)
    operations(manifest, resolver)

}

const createResolver = (properties) => (property) => {
  if (properties?.[property] === undefined) {
    throw new Error(`Referenced property '${property}' is not defined`)
  }

  return properties[property]
}

function operations (manifest, resolver) {
  for (const operation of Object.values(manifest.operations)) {
    if (operation.input !== undefined) operation.input = schema(operation.input, resolver)

    if (operation.output !== undefined)
      if (Array.isArray(operation.output) && operation.output.length === 1)
        operation.output = [schema(operation.output[0], resolver)]
      else
        operation.output = schema(operation.output, resolver)
  }

  // forwarding
  for (const operation of Object.values(manifest.operations)) {
    if (operation.forward !== undefined) forward(operation, manifest.operations)
  }

  for (const operation of Object.values(manifest.operations)) {
    delete operation.forwarded
  }

}

const schema = (object, resolve) => {
  if (object === undefined || object === null || typeof object !== 'object') return
  if (object.type === 'string' && object.default?.[0] === '.') return resolve(object.default.substring(1))

  if (object.type === 'array') {
    object.items = schema(object.items, resolve)
  } else if (object.properties !== undefined) {
    for (const [name, value] of Object.entries(object.properties)) {
      if (value?.type === 'string' && value.default === '.') object.properties[name] = resolve(name)
      else object.properties[name] = schema(value, resolve)
    }
  }

  return object
}

const forward = (operation, operations) => {
  const target = operations[operation.forward]

  if (target === undefined) throw new Error(`Referenced operation '${operation.forward}' is not defined`)

  if (target.forward !== undefined) {
    if (target.forwarded !== true) forward(target, operations)

    operation.forward = target.forward
  }

  operation.forwarded = true

  const { virtual, ...real } = target

  merge(operation, real)
}

exports.dereference = dereference
