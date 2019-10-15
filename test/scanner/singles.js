import test from 'ava'
import { scan } from '../../src/scanner'

test('Scanner: Single character tokens', async (t) => {
  const cases = [
    ['`(`', ['TICK', 'LEFT_PAREN', 'TICK']],
    ['`)`', ['TICK', 'RIGHT_PAREN', 'TICK']],
    ['`,`', ['TICK', 'COMMA', 'TICK']],
    ['`.`', ['TICK', 'DOT', 'TICK']],
    ['`:`', ['TICK', 'COLON', 'TICK']],
    ['`-`', ['TICK', 'MINUS', 'TICK']],
    ['`+`', ['TICK', 'PLUS', 'TICK']],
    ['`*`', ['TICK', 'STAR', 'TICK']],
    ['`^`', ['TICK', 'POWER', 'TICK']],
    ['`/`', ['TICK', 'SLASH', 'TICK']]
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
