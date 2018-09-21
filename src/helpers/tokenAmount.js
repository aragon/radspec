const BN = require('bn.js')
const { ABI, ETH } = require('./lib/token')

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

  // Inspired by: https://github.com/ethjs/ethjs-unit/blob/35d870eae1c32c652da88837a71e252a63a83ebb/src/index.js#L83
  const tenPow = x => (new BN(10)).pow(new BN(x))
  const base = tenPow(decimals)
  const baseLength = base.toString().length

  let fraction = amount.mod(base).toString()
  const zeros = '0'.repeat(Math.max(0, baseLength - fraction.length - 1))
  fraction = `${zeros}${fraction}`
  const whole = amount.div(base).toString()

  const formattedAmount = `${whole}${fraction === '0' ? '' : `.${fraction.slice(0, precision)}`}`

  return {
    type: 'string',
    value: showSymbol ? `${formattedAmount} ${symbol}` : formattedAmount
  }
}
