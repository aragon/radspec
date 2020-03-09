import HelperManager from './HelperManager'
import echo from './echo'
import formatDate from './formatDate'
import fromHex from './fromHex'
import formatPct from './formatPct'
import fromWei from './fromWei'
import tokenAmount from './tokenAmount'
import transformTime from './transformTime'
import radspec from './radspec'

const defaultHelpers = {
  formatDate,
  transformTime,
  fromWei,
  tokenAmount,
  formatPct,
  fromHex,
  radspec,
  echo
}

export {
  HelperManager,
  defaultHelpers,

  echo,
  formatDate,
  formatPct,
  fromHex,
  radspec,
  transformTime,
  fromWei,
  tokenAmount
}
