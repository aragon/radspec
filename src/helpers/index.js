import HelperManager from './HelperManager'
import echo from './echo'
import formatDate from './formatDate'
import fromHex from './fromHex'
import formatPct from './formatPct'
import tokenAmount from './tokenAmount'
import transformTime from './transformTime'
import radspec from './radspec'
import parseIpfs from './parseIpfs'

const defaultHelpers = {
  formatDate,
  transformTime,
  tokenAmount,
  formatPct,
  fromHex,
  radspec,
  echo,
  parseIpfs
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
  parseIpfs
}
