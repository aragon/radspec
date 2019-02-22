const HelperManager = require('./HelperManager')
const formatDate = require('./formatDate')
const echo = require('./echo')
const tokenAmount = require('./tokenAmount')
const transformTime = require('./transformTime')
const formatPct = require('./formatPct')
const radspec = require('./radspec')

const defaultHelpers = {
  formatDate,
  transformTime,
  tokenAmount,
  formatPct,
  radspec,
  echo
}

module.exports = {
  HelperManager,
  defaultHelpers,

  echo,
  formatDate,
  formatPct,
  radspec,
  transformTime,
  tokenAmount
}
