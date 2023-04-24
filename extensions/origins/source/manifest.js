'use strict'

const { remap, echo, shards } = require('@toa.io/generic')
const schemas = require('./schemas')
const protocols = require('./protocols')

/**
 * @param {toa.origins.Manifest} manifest
 * @returns {toa.origins.Manifest}
 */
function manifest (manifest) {
  if (manifest === null) return {}

  manifest = remap(manifest, echo)
  validate(manifest)

  for (const url of Object.values(manifest)) {
    const supported = protocols.find((provider) => supports(provider, url))

    if (supported === undefined) throw new Error(`'${url}' protocol is not supported`)
  }

  return manifest
}

/**
 * @param {toa.origins.Manifest} manifest
 */
function validate (manifest) {
  manifest = remap(manifest, (value) => shards(value)[0])
  schemas.manifest.validate(manifest)
}

function supports (provider, url) {
  return provider.protocols.findIndex((protocol) => url.substring(0, protocol.length) === protocol) !== -1
}

exports.manifest = manifest
