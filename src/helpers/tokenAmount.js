import { BigNumber, Contract, utils as ethersUtils } from 'ethers'

import {
  ERC20_SYMBOL_BYTES32_ABI,
  ERC20_SYMBOL_DECIMALS_ABI,
  ETH
} from './lib/token'
import { formatBN, tenPow } from './lib/formatBN'

export default (provider) =>
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
    const amountBn = BigNumber.from(amount)
    const fixed = !!precision

    let decimals
    let symbol

    if (tokenAddress === ETH) {
      decimals = BigNumber.from(18)
      if (showSymbol) {
        symbol = 'ETH'
      }
    } else {
      let token = new Contract(
        tokenAddress,
        ERC20_SYMBOL_DECIMALS_ABI,
        provider
      )

      decimals = BigNumber.from(await token.decimals())
      if (showSymbol) {
        try {
          symbol = (await token.symbol()) || ''
        } catch (err) {
          // Some tokens (e.g. DS-Token) use bytes32 for their symbol()
          token = new Contract(
            tokenAddress,
            ERC20_SYMBOL_BYTES32_ABI,
            provider
          )
          symbol = (await token.symbol()) || ''
          symbol = symbol && ethersUtils.toUtf8String(symbol)
        }
      }
    }

    precision = precision || decimals

    const formattedAmount = formatBN(
      amountBn,
      tenPow(decimals),
      Number(precision),
      fixed
    )

    return {
      type: 'string',
      value: showSymbol ? `${formattedAmount} ${symbol}` : formattedAmount
    }
  }
