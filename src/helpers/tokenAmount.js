import BN from 'bn.js'
import { toUtf8 } from 'web3-utils'
import { ERC20_SYMBOL_BYTES32_ABI, ERC20_SYMBOL_DECIMALS_ABI, ETH } from './lib/token'
import { formatBN, tenPow } from './lib/formatBN'

export default (eth) =>
  /**
   * Format token amounts taking decimals into account
   *
   * @param {string} tokenAddress The address of the token
   * @param {*} amount The absolute amount for the token quantity (wei)
   * @param {bool} showSymbol Whether the token symbol will be printed after the amount
   * @param {*} precision The number of decimal places to format to. If set, the precision is always enforced.
   * @return {Promise<radspec/evaluator/TypedValue>}
   */
  async (tokenAddress, amount, showSymbol = true, precision) => {
    const amountBn = new BN(amount)
    const fixed = !!precision

    let decimals
    let symbol

    if (tokenAddress === ETH) {
      decimals = new BN(18)
      if (showSymbol) {
        symbol = 'ETH'
      }
    } else {
      let token = new eth.Contract(ERC20_SYMBOL_DECIMALS_ABI, tokenAddress)

      decimals = new BN(await token.methods.decimals().call())
      if (showSymbol) {
        try {
          symbol = await token.methods.symbol().call() || ''
        } catch (err) {
          // Some tokens (e.g. DS-Token) use bytes32 for their symbol()
          token = new eth.Contract(ERC20_SYMBOL_BYTES32_ABI, tokenAddress)
          symbol = await token.methods.symbol().call() || ''
          symbol = symbol && toUtf8(symbol)
        }
      }
    }

    precision = precision || decimals

    const formattedAmount = formatBN(amountBn, tenPow(decimals), Number(precision), fixed)

    return {
      type: 'string',
      value: showSymbol ? `${formattedAmount} ${symbol}` : formattedAmount
    }
  }
