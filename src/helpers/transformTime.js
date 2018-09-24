const moment = require('moment')

module.exports = () =>
  /**
   * Transform between time units
   *
   * @param {integer} time The base time amount
   * @param {string} toUnit The unit to convert the time to (seconds, minutes, hours, years...), or 'humanize' for a human timespan
   * @param {string} fromUnit The unit to convert the time from (seconds, minutes, hours, years...)
   * @return {Promise<radspec/evaluator/TypedValue>}
   */
  async (time, toUnit, fromUnit = 'seconds') => {
    const duration = moment.duration(time.toNumber(), fromUnit)

    return {
      type: 'string',
      value: toUnit === 'humanize' ? duration.humanize() : Math.round(duration.as(toUnit))
    }
  }
