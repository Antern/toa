'use strict'

const uuid = require('uuid').v4

const newid = () => {
  const buffer = Buffer.allocUnsafe(16)

  // noinspection JSCheckFunctionSignatures
  uuid({}, buffer)

  return buffer.toString('hex')
}

exports.newid = newid
