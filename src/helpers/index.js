const formatDate = require('./formatDate')
const echo = require('./echo')
const tokenAmount = require('./tokenAmount')
const transformTime = require('./transformTime')
const formatPct = require('./formatPct')

const defaultHelpers = {
  formatDate,
  transformTime,
  tokenAmount,
  formatPct,
  echo
}

/**
 * Class for managing the execution of helper functions
 *
 * @class Helpers
 * @param {web3/eth} eth web3.eth instance
 * @param {Object.<string,helpers/Helper>} userHelpers User defined helpers
 */
class Helpers {
  constructor (eth, userHelpers = {}) {
    this.eth = eth
    this.helpers = { ...defaultHelpers, ...userHelpers }
  }

  /**
   * Does a helper exist
   *
   * @param  {string} helper Helper name
   * @return {bool}
   */
  exists (helper) {
    return !!this.helpers[helper]
  }

  /**
   * Execute a helper with some inputs
   *
   * @param  {string} helper Helper name
   * @param  {Array<radspec/evaluator/TypedValue>} inputs
   * @return {Promise<radspec/evaluator/TypedValue>}
   */
  execute (helper, inputs) {
    inputs = inputs.map(input => input.value) // pass values directly
    return this.availableHelpers[helper](this.eth)(...inputs)
  }
}

module.exports = {
  Helpers,

  ...defaultHelpers
}
