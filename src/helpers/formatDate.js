import formatDate from 'date-fns/format'

module.exports = () =>
  /**
   * Format a timestamp as a string
   *
   * @param {*} timestamp Unix timestamp in seconds
   * @param {string} [format='MMM. do y'] Format for the date, defaults to a format like "Jan. 1st 2000"
   *                                      Uses unicode TR35 symbols; see https://date-fns.org/v2.0.0-alpha.22/docs/format
   * @return {Promise<radspec/evaluator/TypedValue>}
   */
  async (timestamp, format = 'MMM. do y') => {
    return {
      type: 'string',
      value: formatDate(new Date(Number(timestamp) * 1000), format)
    }
  }
