const test = require('ava')
const { scan } = require('../../src/scanner')

test('Scanner: Booleans', async (t) => {
  t.plan(2)

  t.deepEqual(
    await scan('`true`'),
    [
      { type: 'TICK' },
      { type: 'BOOLEAN', value: 'true' },
      { type: 'TICK' }
    ]
  )

  t.deepEqual(
    await scan('`false`'),
    [
      { type: 'TICK' },
      { type: 'BOOLEAN', value: 'false' },
      { type: 'TICK' }
    ]
  )
})
