const moment = require('moment')

module.exports = () => async (timestamp, format = 'MM-DD-YYYY') => {
  return {
    type: 'string',
    value: moment(timestamp * 1000).format(format)
  }
}
