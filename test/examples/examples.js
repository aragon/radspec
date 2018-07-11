const test = require('ava')
const { evaluateRaw } = require('../../src')
const BN = require('bn.js')

const int = (value) => ({
  type: 'int256',
  value
})

const address = (value) => ({
  type: 'address',
  value
})

const bool = (value) => ({
  type: 'bool',
  value
})

const string = (value) => ({
  type: 'string',
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
    source: 'First case is `2 * 2 + 6`, second case is `2 * (2 + 6)`'
  }, 'First case is 10, second case is 16'],
  [{
    source: 'First case is `2^5`, second case is `2^2 + 1`'
  }, 'First case is 32, second case is 5'],
  [{
    source: 'First case is `(11 - 1) * 2^5`, second case is `3 * 2 ^ (4 - 1) + 1`'
  }, 'First case is 320, second case is 25'],
  [{
    source: 'First case is `(11 - 1) / 2`, second case is `3 * 2 ^ (4 - 1) / 3`'
  }, 'First case is 5, second case is 8'],
  [{
    source: 'First case is `(11 - 1) % 3`, second case is `3 * 2 % 5`'
  }, 'First case is 1, second case is 1'],
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
    source: 'Burns the `token.symbol(): string` balance of `person` (balance is `token.balanceOf(person): uint256 / 1000000000000000000`)',
    bindings: { token: address('0x960b236A07cf122663c4303350609A66A7B288C0'), person: address('0x0000000000000000000000000000000000000000') }
  }, 'Burns the ANT balance of 0x0000000000000000000000000000000000000000 (balance is 0)'],
  [{
    source: 'Initialize Finance app for Vault at `_vault` with period length of `(_periodDuration - _periodDuration % 86400) / 86400` day`_periodDuration >= 172800 ? \'s\' : \' \'`',
    bindings: { _periodDuration: int(86400 * 2), _vault: address('0x960b236A07cf122663c4303350609A66A7B288C0') }
  }, 'Initialize Finance app for Vault at 0x960b236A07cf122663c4303350609A66A7B288C0 with period length of 2 days'],
  [{
    source: 'Vote `_supports ? \'yay\' : \'nay\'`',
    bindings: { _supports: bool(false) }
  }, 'Vote nay'],
  [{
    source: 'Token `_amount / 10^18`',
    bindings: { _amount: int(new BN(10).mul(new BN(10).pow(new BN(18)))) }
  }, 'Token 10'],
  [{
    source: '`_bool ? \'h\' + _var + \'o\' : \'damn\'`',
    bindings: { _bool: bool(true), _var: string('ell') }
  }, 'hello']
]

for (let [input, expected] of cases) {
  test(input.source, async (t) => {
    const actual = await evaluateRaw(input.source, input.bindings)
    t.is(
      actual,
      expected,
      `Expected "${input.source}" to evaluate to "${expected}", but evaluated to "${actual}"`
    )
  })
}
