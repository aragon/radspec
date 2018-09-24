const { formatBN, tenPow } = require('./lib/formatBN')

module.exports = () =>
  /**
   * Format a percentage amount
   *
   * @param {integer} value The absolute number that will be formatted as a percentage
   * @param {integer} base The number that is considered a 100% when calculating the percentage
   * @param {integer} precision The number of decimals that will be printed (if any)
   * @return {Promise<radspec/evaluator/TypedValue>}
   */
  async (value, base = tenPow(18), precision = 2) => {
    const oneHundred = tenPow(2)
    const formattedAmount = formatBN(value.mul(oneHundred), base, precision)

    return {
      type: 'string',
      value: `${formattedAmount}`
    }
  }
