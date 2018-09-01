const test = require('ava')
const { scan } = require('../../src/scanner')

test('Scanner: One or two character tokens', async (t) => {
  const cases = [
    ['`!`', ['TICK', 'BANG', 'TICK']],
    ['`!=`', ['TICK', 'BANG_EQUAL', 'TICK']],
    ['`=`', ['TICK', 'EQUAL', 'TICK']],
    ['`==`', ['TICK', 'EQUAL_EQUAL', 'TICK']],
    ['`<`', ['TICK', 'LESS', 'TICK']],
    ['`<=`', ['TICK', 'LESS_EQUAL', 'TICK']],
    ['`>`', ['TICK', 'GREATER', 'TICK']],
    ['`>=`', ['TICK', 'GREATER_EQUAL', 'TICK']],
    ['`||`', ['TICK', 'DOUBLE_VERTICAL_BAR', 'TICK']]
  ]
  t.plan(cases.length)

  for (let [input, expected] of cases) {
    const actual = await scan(input)
    t.deepEqual(
      actual.map((token) => token.type),
      expected,
      `Expected "${input}" to give a "${expected[1]}" token, got a "${actual[1].type}" token`
    )
  }
})
