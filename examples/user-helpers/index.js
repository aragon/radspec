import * as radspec from '../../src'
import Web3 from 'web3'

const expression = '`@toUtf8(gretting)` world.'
const call = {
  abi: [
    {
      name: 'sayHi',
      constant: false,
      type: 'function',
      inputs: [
        {
          name: 'gretting',
          type: 'bytes'
        }
      ],
      outputs: []
    }
  ],
  transaction: {
    data: '0x2e8dedd00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000548656c6c6f000000000000000000000000000000000000000000000000000000'
  }
}
const options = {
  userHelpers: {
    toUtf8: () => async (hex) => {
      return {
        type: 'string',
        value: Web3.utils.hexToUtf8(hex)
      }
    }
  }
}

radspec.evaluate(expression, call, options)
  .then(console.log) // => "Hello world."
  .catch(console.error)
