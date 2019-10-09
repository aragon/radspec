import BN from 'bn.js'

function sameFraction (first, second) {
  // First remove any trailing zeros, since they're meaningless in fractions
  first = first.replace(/0+$/, '')
  second = second.replace(/0+$/, '')

  // Check that these two values are the same.
  // Note that leading zeros ARE meaningful, and so we do the comparision after
  // appending a one as the first digit.
  //
  // For example, .001 and .00100 are the same value, but .0001 and .001 are not.
  return (new BN(`1${first}`).eq(new BN(`1${second}`)))
}

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
  const fractionWithoutTrailingZeros = fraction.replace(/0+$/, '')
  const fractionAfterPrecision = (fixed ? fraction : fractionWithoutTrailingZeros).slice(0, precision)

  if (!fixed && (fractionAfterPrecision === '' || parseInt(fractionAfterPrecision, 10) === 0)) {
    return whole
  }

  const prefix = sameFraction(fractionAfterPrecision, fraction) ? '' : '~'

  return `${prefix}${whole}.${fractionAfterPrecision}`
}
