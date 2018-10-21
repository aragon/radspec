const BN = require('bn.js')
const { ERC20_SYMBOL_DECIMALS_ABI, ETH } = require('./lib/token')
const { formatBN, tenPow } = require('./lib/formatBN')

module.exports = (eth) =>
  /**
   * Format token amounts taking decimals into account
   *
   * @param {string} tokenAddress The address of the token
   * @param {*} amount The absolute amount for the token quantity (wei)
   * @param {bool} showSymbol Whether the token symbol will be printed after the amount
   * @param {*} [precision=2] The number of decimal places to format to
   * @return {Promise<radspec/evaluator/TypedValue>}
   */
  async (tokenAddress, amount, showSymbol = true, precision = 2) => {
    const amountBn = new BN(amount)

    let decimals
    let symbol

    if (tokenAddress === ETH) {
      decimals = new BN(18)
      if (showSymbol) {
        symbol = 'ETH'
      }
    } else {
      const token = new eth.Contract(ERC20_SYMBOL_DECIMALS_ABI, tokenAddress)

      decimals = new BN(await token.methods.decimals().call())
      if (showSymbol) {
        symbol = await token.methods.symbol().call()
      }
    }

    const formattedAmount = formatBN(amountBn, tenPow(decimals), Number(precision))

    return {
      type: 'string',
      value: showSymbol ? `${formattedAmount} ${symbol}` : formattedAmount
    }
  }
