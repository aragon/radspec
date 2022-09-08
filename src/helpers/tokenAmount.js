import BN from 'bn.js'
import Web3 from 'web3'
import {
  ERC20_SYMBOL_BYTES32_ABI,
  ERC20_SYMBOL_DECIMALS_ABI,
  NON_TOKEN_ADDRESS
} from './lib/token'
import { formatBN, tenPow } from './lib/formatBN'

export default (eth, evaluator) =>
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

    if (tokenAddress === NON_TOKEN_ADDRESS) {
      decimals = new BN(evaluator.currency.decimals)
      if (showSymbol) {
        symbol = evaluator.currency.symbol
      }
    } else {
      let token = new eth.eth.Contract(ERC20_SYMBOL_DECIMALS_ABI, tokenAddress)

      decimals = new BN(await token.methods.decimals().call())
      if (showSymbol) {
        try {
          symbol = await token.methods.symbol().call() || ''
        } catch (err) {
          // Some tokens (e.g. DS-Token) use bytes32 for their symbol()
          token = new eth.eth.Contract(ERC20_SYMBOL_BYTES32_ABI, tokenAddress)
          symbol = await token.methods.symbol().call() || ''
          symbol = symbol && Web3.utils.hexToUtf8(symbol)
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
