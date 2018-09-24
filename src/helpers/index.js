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

class Helpers {
  constructor (eth, userHelpers = {}) {
    this.eth = eth
    this.helpers = { ...defaultHelpers, ...userHelpers }
  }

  exists (helper) {
    return !!this.helpers[helper]
  }

  execute (helper, inputs) {
    inputs = inputs.map(input => input.value) // pass values directly
    return this.helpers[helper](this.eth)(...inputs)
  }
}

module.exports = {
  Helpers,

  defaultHelpers
}
