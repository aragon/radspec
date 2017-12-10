const test = require('ava')
const { evaluateRaw } = require('../../src')

const cases = [
  [{
    source: 'Will multiply `a` by 7 and return `a * 7`',
    bindings: { a: 122 }
  }, 'Will multiply 122 by 7 and return 854']
]

test('Examples', async (t) => {
  for (let [input, expected] of cases) {
    const actual = await evaluateRaw(input.source, input.bindings)
    t.is(
      actual,
      expected,
      `Expected "${input}" to evaluate to "${expected}", but evaluated to "${actual}"`
    )
  }
})
