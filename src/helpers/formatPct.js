const { formatBN, tenPow } = require('./lib/formatBN')

module.exports = () => async (value, base = tenPow(18), precision = 2) => {
  const oneHundred = tenPow(2)
  const formattedAmount = formatBN(value.mul(oneHundred), base, precision)

  return {
    type: 'string',
    value: `${formattedAmount}`
  }
}
