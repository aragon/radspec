const moment = require('moment')

module.exports = () =>
  /**
   * Format a timestamp as a string (using moment.js)
   *
   * @param {integer} timestamp Unix timestamp
   * @param {string} format The format for the date
   * @return {Promise<radspec/evaluator/TypedValue>}
   */
  async (timestamp, format = 'MM-DD-YYYY') => {
    return {
      type: 'string',
      value: moment(timestamp.toNumber() * 1000).format(format)
    }
  }
