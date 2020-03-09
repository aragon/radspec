import BN from 'bn.js'
import { toUtf8 } from 'web3-utils'
import { formatBN, tenPow } from './lib/formatBN'

export default (eth) =>
  /**
   * Format token amounts taking decimals into account
   *
   * @param {*} amount The absolute amount for the token quantity (wei)
   * @param precision The number of decimal places to format to. If set, the precision is always enforced.
   * @return {Promise<radspec/evaluator/TypedValue>}
   */
  async (amount, precision = 18) => {
    const amountBn = new BN(amount)

    const formattedAmount = formatBN(amountBn, tenPow(precision), Number(precision), false)

    return {
      type: 'string',
      value: formattedAmount
    }
  }
