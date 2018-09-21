const formatDate = require('./formatDate')
const echo = require('./echo')
const tokenAmount = require('./tokenAmount')

const defaultHelpers = {
  formatDate,
  echo,
  tokenAmount
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
