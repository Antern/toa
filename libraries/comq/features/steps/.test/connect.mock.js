'use strict'

const { generate } = require('randomstring')

const connect = jest.fn(async () => generate())

exports.comq = { connect }
