'use strict'

const { invoke } = require('../handlers/invoke')

const builder = (yargs) => {
  yargs
    .usage('Usage: kookaburra invoke sum --input.a=1 --input.b=2')
    .option('input', {
      describe: 'Input object'
    })
}

exports.command = 'invoke <operation>'
exports.desc = 'Invoke Operation'
exports.builder = builder
exports.handler = invoke
