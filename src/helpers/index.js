import HelperManager from './HelperManager'
import formatDate from './formatDate'
import echo from './echo'
import tokenAmount from './tokenAmount'
import transformTime from './transformTime'
import formatPct from './formatPct'
import fromHex from './fromHex'
import radspec from './radspec'

const defaultHelpers = {
  formatDate,
  transformTime,
  tokenAmount,
  formatPct,
  fromHex,
  radspec,
  echo
}

module.exports = {
  HelperManager,
  defaultHelpers,

  echo,
  formatDate,
  formatPct,
  fromHex,
  radspec,
  transformTime,
  tokenAmount
}
