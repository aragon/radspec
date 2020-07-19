import * as radspec from '../../src'

const expression = 'Will multiply `a` by 7 and return `a * 7`.'
const call = {
  abi: ['function multiply(uint256 a) public view returns(uint256)'],
  transaction: {
    data: '0xc6888fa1000000000000000000000000000000000000000000000000000000000000007a'
  }
}

radspec.evaluate(expression, call)
  .then(console.log) // => "Will multiply 122 by 7 and return 854."
