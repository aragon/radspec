const BN = require('bn.js')

exports.tenPow = x => (
  (new BN(10, 10)).pow(new BN(x, 10))
)

exports.formatBN = (value, base, precision) => {
  // Inspired by: https://github.com/ethjs/ethjs-unit/blob/35d870eae1c32c652da88837a71e252a63a83ebb/src/index.js#L83
  const baseLength = base.toString().length

  let fraction = value.mod(base).toString()
  const zeros = '0'.repeat(Math.max(0, baseLength - fraction.length - 1))
  fraction = `${zeros}${fraction}`
  const whole = value.div(base).toString()

  return `${whole}${parseInt(fraction, 10) === 0 ? '' : `.${fraction.slice(0, precision)}`}`
}