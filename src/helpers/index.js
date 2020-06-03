import HelperManager from './HelperManager'
import echo from './echo'
import formatDate from './formatDate'
import fromHex from './fromHex'
import formatPct from './formatPct'
import withDecimals from './withDecimals'
import tokenAmount from './tokenAmount'
import transformTime from './transformTime'
import radspec from './radspec'

const defaultHelpers = {
  echo,
  formatDate,
  formatPct,
  fromHex,
  radspec,
  tokenAmount,
  transformTime,
  withDecimals
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
  tokenAmount,
  withDecimals
}
