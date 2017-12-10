const test = require('ava')
const { evaluateRaw } = require('../../src')

const cases = [
  [{
    source: 'Will multiply `a` by 7 and return `a * 7`',
    bindings: { a: 122 }
  }, 'Will multiply 122 by 7 and return 854'],

  [{
   source: 'Basic arithmetic: `a` + `b` is `a + b`, - `c` that\'s `a + b - c`, quick mafs',
   bindings: { a: 2, b: 2, c: 1 }
  }, 'Basic arithmetic: 2 + 2 is 4, - 1 that\'s 3, quick mafs']
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
