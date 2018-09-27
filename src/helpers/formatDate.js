const formatDate = require('date-fns/format')

module.exports = () =>
  /**
   * Format a timestamp as a string (using date-fns)
   *
   * @param {integer} timestamp Unix timestamp
   * @param {string} format The format for the date (https://date-fns.org/v2.0.0-alpha.7/docs/format)
   * @return {Promise<radspec/evaluator/TypedValue>}
   */
  async (timestamp, format = 'MM-DD-YYYY') => {
    return {
      type: 'string',
      value: formatDate(new Date(timestamp.toNumber() * 1000), format)
    }
  }
