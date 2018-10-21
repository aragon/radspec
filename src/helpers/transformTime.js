const formatDistanceStrict = require('date-fns/formatDistanceStrict')

const BEST_UNIT = 'best'
const TO_UNIT_MAP = {
  seconds: 's',
  minutes: 'm',
  hours: 'h',
  days: 'd',
  months: 'M',
  years: 'Y'
}
const SUPPORTED_TO_UNITS = new Set(Object.keys(TO_UNIT_MAP).concat(BEST_UNIT))
const SUPPORTED_FROM_UNITS = new Set([
  ...Object.keys(TO_UNIT_MAP),
  'milliseconds',
  'weeks'
])

module.exports = () =>
  /**
   * Transform between time units.
   *
   * @param {integer} time The base time amount
   * @param {string} toUnit The unit to convert the time to (Supported units: 'seconds', 'minutes', 'hours', 'days', 'months', 'years')
   * @param {string} fromUnit The unit to convert the time from (Supported units: 'milliseconds', 'seconds', 'minutes', 'hours', 'days', 'weeks', 'months', 'years')
   * @return {Promise<radspec/evaluator/TypedValue>}
   */
  async (time, toUnit = BEST_UNIT, fromUnit = 'seconds') => {
    if (!SUPPORTED_FROM_UNITS.has(fromUnit)) {
      throw new Error(`@transformTime: Time unit ${fromUnit} is not supported as a fromUnit`)
    }

    if (!SUPPORTED_TO_UNITS.has(toUnit)) {
      throw new Error(`@transformTime: Time unit ${toUnit} is not supported as a toUnit`)
    }

    const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1)
    const add = require(`date-fns/add${capitalize(fromUnit)}`)

    const zeroDate = new Date(0)
    const duration = addTime(zeroDate, Number(time))

    const options = toUnit === BEST_UNIT ? {} : { unit: TO_UNIT_MAP[toUnit] }
    return {
      type: 'string',
      value: formatDistanceStrict(zeroDate, duration, options)
    }
  }
