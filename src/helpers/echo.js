module.exports = () =>
  /**
   * Repeats a string (testing helper)
   *
   * @param {string} echo The string
   * @param {*} [repeat=1] Number of times to repeat the string
   * @return {Promise<radspec/evaluator/TypedValue>}
   */
  async (echo, repeat = 1) =>
    ({
      type: 'string',
      value: echo.repeat(Number(repeat))
    })
