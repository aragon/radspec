import test from 'ava'
import { scan } from '../../src/scanner'

test('Scanner: types', async (t) => {
  const cases = [
    ['`bool`', ['TICK', { type: 'TYPE', value: 'bool' }, 'TICK']],
    ['`int`', ['TICK', { type: 'TYPE', value: 'int' }, 'TICK']],
    ['`uint`', ['TICK', { type: 'TYPE', value: 'uint' }, 'TICK']],
    ['`address`', ['TICK', { type: 'TYPE', value: 'address' }, 'TICK']],
    ['`bytes`', ['TICK', { type: 'TYPE', value: 'bytes' }, 'TICK']],
    ['`bytes1`', ['TICK', { type: 'TYPE', value: 'bytes1' }, 'TICK']],
    ['`bytes32`', ['TICK', { type: 'TYPE', value: 'bytes32' }, 'TICK']],
    ['`string`', ['TICK', { type: 'TYPE', value: 'string' }, 'TICK']],
    ['`fixed`', ['TICK', { type: 'TYPE', value: 'fixed' }, 'TICK']],
    ['`ufixed`', ['TICK', { type: 'TYPE', value: 'ufixed' }, 'TICK']]
  ]
  t.plan(cases.length)

  for (let [input, expected] of cases) {
    const actual = await scan(input)
    t.deepEqual(
      actual.map((token) => {
        // Strip out details from non-type tokens
        if (token.type !== 'TYPE') {
          return token.type
        }
        return token
      }),
      expected,
      `Expected "${input}" to give a "${expected[1]}" token, got a "${actual[1].type}" token`
    )
  }
})
