import Web3 from 'web3'
export default () =>
  /**
   * Returns the string representation of a given hex value
   *
   * @param {string} hex The hex string
   * @param {string} [to='utf8'] The type to convert the hex from (supported types: 'utf8', 'number', 'decimal')
   * @return {radspec/evaluator/TypedValue}
   */
  (hex, to = 'utf8') =>
    ({
      type: 'string',
      value:
        to === 'utf8'
          ? Web3.utils.hexToUtf8(hex)
          : to === 'ascii'
            ? Web3.utils.hexToAscii(hex)
            : Web3.utils.hexToNumber(hex)
    })
