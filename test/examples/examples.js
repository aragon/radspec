const test = require('ava')
const { evaluateRaw } = require('../../src')

const int = (value) => ({
  type: 'int256',
  value
})

const address = (value) => ({
  type: 'address',
  value
})

const cases = [
  // Bindings
  [{
    source: 'a is `a`, b is `b` and "c d" is `c d`',
    bindings: { a: int(1), b: int(2), c: int(3), d: int(4) }
  }, 'a is 1, b is 2 and "c d" is 3 4'],

  // Maths
  [{
    source: 'Will multiply `a` by 7 and return `a * 7`',
    bindings: { a: int(122) }
  }, 'Will multiply 122 by 7 and return 854'],

  [{
   source: 'Basic arithmetic: `a` + `b` is `a + b`, - `c` that\'s `a + b - c`, quick mafs',
   bindings: { a: int(2), b: int(2), c: int(1) }
  }, 'Basic arithmetic: 2 + 2 is 4, - 1 that\'s 3, quick mafs'],

  // External calls
  [{
    source: 'Allocate `amount token.symbol(): string`.',
    bindings: { amount: int(100), token: address('0x960b236A07cf122663c4303350609A66A7B288C0') }
  }, 'Allocate 100 ANT.'],
  [{
    source: 'Burns the `token.symbol(): string` balance of `person` (balance is `token.balanceOf(person): uint256`)',
    bindings: { token: address('0x960b236A07cf122663c4303350609A66A7B288C0'), person: address('0x6bce4f3ad3a9b9e98982e94da3352c94d06dfcb1') }
  }, 'Burns the ANT balance of 0x0 (balance is 0)']
]

test('Examples', async (t) => {
  for (let [input, expected] of cases) {
    const actual = await evaluateRaw(input.source, input.bindings)
    t.is(
      actual,
      expected,
      `Expected "${input.source}" to evaluate to "${expected}", but evaluated to "${actual}"`
    )
  }
})
