'use strict'

const assert = require('node:assert')
const { timeout } = require('@toa.io/libraries/generic')

const { execute } = require('./.command/execute')

const { When, Then } = require('@cucumber/cucumber')

When('I run {command}',
  /**
   * @param {string} command
   * @return {Promise<void>}
   */
  async function (command) {
    this.process = execute.call(this, command)

    const grace = timeout(500)

    await Promise.any([grace, this.process])
  })

When('I abort execution', async function () {
  this.controller.abort()

  await this.process

  assert.equal(this.aborted, true, 'Program exited before abortion')
})

Then('program should exit', async function () {
  await this.process
})
