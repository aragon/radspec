const radspec = require('../../src')

const expression = 'Allocate `amount token.symbol(): string`.'
const call = {
  abi: [{
    name: 'allocate',
    constant: false,
    type: 'function',
    inputs: [{
      name: 'token',
      type: 'address'
    }, {
      name: 'amount',
      type: 'uint256'
    }],
    outputs: []
  }],
  transaction: {
    data: '0xb78b52df000000000000000000000000960b236a07cf122663c4303350609a66a7b288c00000000000000000000000000000000000000000000000000000000000000064'
  }
}

radspec.evaluate(expression, call)
  .then(console.log) // => "Allocate 100 ANT."
