import BN from 'bn.js'

export const tenPow = x => (
  (new BN(10)).pow(new BN(x))
)

export const formatBN = (amount, base, precision, fixed = false) => {
  // Inspired by: https://github.com/ethjs/ethjs-unit/blob/35d870eae1c32c652da88837a71e252a63a83ebb/src/index.js#L83
  const baseLength = base.toString().length

  const whole = amount.div(base).toString()
  let fraction = amount.mod(base).toString()
  const zeros = '0'.repeat(Math.max(0, baseLength - fraction.length - 1))

  fraction = `${zeros}${fraction}`

  if (!fixed) fraction = fraction.replace(/0+$/, '')

  const slicedFraction = fraction.slice(0, precision)

  if (!fixed && (slicedFraction === '' || parseInt(slicedFraction, 10) === 0)) {
    return whole
  }

  const prefix = (new BN(slicedFraction).eq(new BN(fraction)) || !fixed) ? '' : '~'

  return `${prefix}${whole}.${slicedFraction}`
}
