const test = require('ava')
const { scan } = require('../../src/scanner')

test('Scanner: Numbers', async (t) => {
  t.plan(2)

  t.deepEqual(
    await scan('`1234567890`'),
    [
      { type: 'TICK' },
      { type: 'NUMBER', value: '1234567890' },
      { type: 'TICK' }
    ]
  )

  t.deepEqual(
    await scan('`0xdeadbeef`'),
    [
      { type: 'TICK' },
      { type: 'HEXADECIMAL', value: '0xdeadbeef' },
      { type: 'TICK' }
    ]
  )
})
