import { ethers } from 'ethers'

import * as radspec from '../../src'

const expression = '`@toUtf8(gretting)` world.'
const call = {
  abi: ['function sayHi(bytes gretting) public'],
  transaction: {
    data: '0x2e8dedd00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000548656c6c6f000000000000000000000000000000000000000000000000000000'
  }
}
const options = {
  userHelpers: {
    toUtf8: () => async (hex) => {
      return {
        type: 'string',
        value: ethers.toUtf8String(hex)
      }
    }
  }
}

radspec.evaluate(expression, call, options)
  .then(console.log) // => "Hello world."
  .catch(console.error)
