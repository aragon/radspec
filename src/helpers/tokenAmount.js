const BN = require('bn.js')
const { ABI, ETH } = require('./lib/token')
const { formatBN, tenPow } = require('./lib/formatBN')

module.exports = (eth) => async (addr, amount, showSymbol = true, precision = new BN(2)) => {
  let decimals
  let symbol

  if (addr === ETH) {
    decimals = new BN(18)
    if (showSymbol) {
      symbol = 'ETH'
    }
  } else {
    const token = new eth.Contract(ABI, addr)

    decimals = new BN(await token.methods.decimals().call())
    if (showSymbol) {
      symbol = await token.methods.symbol().call()
    }
  }

  const formattedAmount = formatBN(amount, tenPow(decimals), precision)

  return {
    type: 'string',
    value: showSymbol ? `${formattedAmount} ${symbol}` : formattedAmount
  }
}
