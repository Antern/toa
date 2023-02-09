'use strict'

const assert = require('node:assert')
const { parse } = require('@toa.io/libraries/yaml')
const { match } = require('@toa.io/libraries/generic')
const { Given, When, Then } = require('@cucumber/cucumber')

Given('function replying {token} queue:',
  /**
   * @param {string} queue
   * @param {string} javascript
   * @this {toa.comq.features.Context}
   */
  async function (queue, javascript) {
    // eslint-disable-next-line no-new-func
    const producer = new Function('return ' + javascript)()

    await this.io.reply(queue, producer)
  })

When('I send following request to the {token} queue:',
  /**
   * @param {string} queue
   * @param {string} yaml
   * @this {toa.comq.features.Context}
   */
  async function (queue, yaml) {
    const payload = parse(yaml)

    this.reply = await this.io.request(queue, payload)
  })

Then('I get the reply:',
  /**
   * @param {string} yaml
   * @this {toa.comq.features.Context}
   */
  function (yaml) {
    const value = parse(yaml)
    const matches = match(this.reply, value)

    assert.equal(matches, true, 'Reply mismatch')
  })
