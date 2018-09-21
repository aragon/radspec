const moment = require('moment')

module.exports = () => async (time, toUnit, fromUnit = 'seconds') => {
  const duration = moment.duration(time.toNumber(), fromUnit)

  return {
    type: 'string',
    value: toUnit === 'humanize' ? duration.humanize() : Math.round(duration.as(toUnit))
  }
}
