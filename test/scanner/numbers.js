const test = require('ava')
const { scan } = require('../../src/scanner')

test('Scanner: Numbers', async (t) => {
  t.plan(1)

  t.deepEqual(
    await scan('`1234567890`'),
    [
      { type: 'TICK' },
      { type: 'NUMBER', value: '1234567890' },
      { type: 'TICK' }
    ]
  )
})
