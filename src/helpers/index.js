import HelperManager from './HelperManager'
import blockTime from './blockTime'
import echo from './echo'
import formatDate from './formatDate'
import fromHex from './fromHex'
import formatPct from './formatPct'
import isBlockMined from './isBlockMined'
import radspec from './radspec'
import tokenAmount from './tokenAmount'
import transformTime from './transformTime'

const defaultHelpers = {
  blockTime,
  echo,
  formatDate,
  formatPct,
  fromHex,
  isBlockMined,
  radspec,
  tokenAmount,
  transformTime
}

export {
  HelperManager,
  defaultHelpers,

  blockTime,
  echo,
  formatDate,
  formatPct,
  fromHex,
  isBlockMined,
  radspec,
  tokenAmount,
  transformTime
}
