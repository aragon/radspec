const radspec = require('../../src')

const expressions = [
  {
    expression: 'Deposit `_amount` to `(_token.controller(): address).sale(): address` `_token.symbol(): string`',
    call: {
      abi: [{
        name: 'allocate',
        constant: false,
        type: 'function',
        inputs: [{
          name: '_token',
          type: 'address'
        }, {
          name: '_amount',
          type: 'uint256'
        }],
        outputs: []
      }],
      transaction: {
        data: '0xb78b52df000000000000000000000000960b236a07cf122663c4303350609a66a7b288c00000000000000000000000000000000000000000000000000000000000000064'
      }
    }
  },
  {
    expression: 'Send `_amount` ETH to `(_token.controller(): address).sale(): address` to buy `_token.symbol(): string`',
    call: {
      abi: [{
        name: 'allocate',
        constant: false,
        type: 'function',
        inputs: [{
          name: '_token',
          type: 'address'
        }, {
          name: '_amount',
          type: 'uint256'
        }],
        outputs: []
      }],
      transaction: {
        data: '0xb78b52df000000000000000000000000960b236a07cf122663c4303350609a66a7b288c00000000000000000000000000000000000000000000000000000000000000064'
      }
    }
  }
]

expressions.forEach(({ expression, call }) => {
  radspec.evaluate(expression, call)
    .then(console.log) // => "Allocate 100 ANT."
})
