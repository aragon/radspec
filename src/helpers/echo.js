module.exports = () => async (echo, repeat = 1) => {
  return {
    type: 'string',
    value: echo.repeat(repeat)
  }
}
