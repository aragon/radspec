const BN = require('bn.js')
const { ABI, ETH } = require('./lib/token')
const { formatBN, tenPow } = require('./lib/formatBN')

module.exports = (eth) =>
  /**
   * Format token amounts taking decimals into account
   *
   * @param {string} tokenAddress The address of the token
   * @param {integer} amount The absolute amount for the token quantity (wei)
   * @param {bool} showSymbol Whether the token symbol will be printed after the amount
   * @param {integer} precision The number of decimals that will be printed (if any)
   * @return {Promise<radspec/evaluator/TypedValue>}
   */
  async (tokenAddress, amount, showSymbol = true, precision = new BN(2)) => {
    let decimals
    let symbol

    if (tokenAddress === ETH) {
      decimals = new BN(18)
      if (showSymbol) {
        symbol = 'ETH'
      }
    } else {
      const token = new eth.Contract(ABI, tokenAddress)

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
