import * as radspec from '../../src'

const expressions = [
  {
    expression: 'Allocate `_amount _token.symbol(): string`.',
    call: {
      abi: ['function allocate(address _token, uint256 _amount) public view'],
      transaction: {
        data: '0xb78b52df000000000000000000000000960b236a07cf122663c4303350609a66a7b288c00000000000000000000000000000000000000000000000000000000000000064'
      }
    }
  },
  {
    expression: 'Send `_amount` wei to `(_token.controller(): address).sale(): address` to buy `_token.symbol(): string`',
    call: {
      abi: ['function allocate(address _token, uint256 _amount) public view'],
      transaction: {
        data: '0xb78b52df000000000000000000000000960b236a07cf122663c4303350609a66a7b288c00000000000000000000000000000000000000000000000000000000000000064'
      }
    }
  }
]

// => "Allocate 100 ANT."
// => "Send 100 wei to 0x0cEB0D54A7e87Dfa16dDF7656858cF7e29851fD7 to buy ANT"
expressions.forEach(({ expression, call }) => {
  radspec.evaluate(expression, call)
    .then(console.log)
})
