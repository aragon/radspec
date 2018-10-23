const addMilliseconds = require('date-fns/addMilliseconds')
const addSeconds = require('date-fns/addSeconds')
const addMinutes = require('date-fns/addMinutes')
const addHours = require('date-fns/addHours')
const addDays = require('date-fns/addDays')
const addWeeks = require('date-fns/addWeeks')
const addMonths = require('date-fns/addMonths')
const addYears = require('date-fns/addYears')
const formatDistanceStrict = require('date-fns/formatDistanceStrict')

const BEST_UNIT = 'best'

const ADD_UNIT_FN = new Map([
  ['millisecond', addMilliseconds],
  ['second', addSeconds],
  ['minute', addMinutes],
  ['hour', addHours],
  ['day', addDays],
  ['week', addWeeks],
  ['month', addMonths],
  ['year', addYears]
])
const DISALLOWED_FROM_UNITS = new Set(['millisecond'])

module.exports = () =>
  /**
   * Transform between time units.
   *
   * @param {*} time The base time amount
   * @param {string} [toUnit] The unit to convert the time to (supported units: 'second', 'minute', 'hour', 'day', 'week', 'month', 'year')
   *                          Defaults to using the "best" unit
   * @param {string} [fromUnit='second'] The unit to convert the time from (supported units: 'millisecond', 'second', 'minute', 'hour', 'day', 'week', 'month', 'year')
   * @return {Promise<radspec/evaluator/TypedValue>}
   */
  async (time, toUnit = BEST_UNIT, fromUnit = 'second') => {
    if (DISALLOWED_FROM_UNITS.has(fromUnit) || !ADD_UNIT_FN.has(fromUnit)) {
      throw new Error(`@transformTime: Time unit '${fromUnit}' is not supported as a fromUnit`)
    }

    if (toUnit !== BEST_UNIT && !ADD_UNIT_FN.has(toUnit)) {
      throw new Error(`@transformTime: Time unit '${toUnit}' is not supported as a toUnit`)
    }

    const addTime = ADD_UNIT_FN.get(fromUnit)

    const zeroDate = new Date(0)
    const duration = addTime(zeroDate, Number(time))

    return {
      type: 'string',
      value: formatDistanceStrict(zeroDate, duration, toUnit !== BEST_UNIT ? { unit: toUnit } : {})
    }
  }
