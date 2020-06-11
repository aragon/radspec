/**
 * @typedef {Object} Binding
 * @property {string} type The type of the binding (a valid Radspec type)
 * @property {*} value The value of the binding
 */
/**
 * @typedef {Object.<string, Binding>} Bindings
 */

/**
 * @module radspec
 */
import { ethers } from 'ethers'
import { defaultHelpers } from './helpers'
import { evaluateRaw } from './lib'

/**
 * Evaluate a radspec expression (`source`) for a transaction (`call`)
 *
 * @example
 * import * as radspec from 'radspec'
 *
 * const expression = 'Will multiply `a` by 7 and return `a * 7`.'
 * const call = {
 *   abi: ['function multiply(uint256 a) public view returns(uint256)'],
 *   transaction: {
 *     to: '0x8521742d3f456bd237e312d6e30724960f72517a',
 *     data: '0xc6888fa1000000000000000000000000000000000000000000000000000000000000007a'
 *   }
 * }
 *
 * radspec.evaluate(expression, call)
 *   .then(console.log) // => "Will multiply 122 by 7 and return 854."
 * @param {string} source The radspec expression
 * @param {Object} call The call that determines the bindings for this evaluation
 * @param {Array} call.abi The ABI used to decode the transaction data
 * @param {Object} call.transaction The transaction to decode for this evaluation
 * @param {string} call.transaction.to The destination address for this transaction
 * @param {string} call.transaction.data The transaction data
 * @param {?Object} options An options object
 * @param {?ethers.providers.Provider} options.provider EIP 1193 provider
 * @param {?Object} options.userHelpers User defined helpers
 * @return {Promise<string>} The result of the evaluation
 */
function evaluate (source, call, { userHelpers = {}, ...options } = {}) {
  // Create ethers interface object
  const ethersInterface = new ethers.utils.Interface(call.abi)

  // Parse as an ethers TransactionDescription
  const { args, functionFragment } = ethersInterface.parseTransaction(
    call.transaction
  )

  const parameters = functionFragment.inputs.reduce(
    (parameters, input) => ({
      [input.name]: {
        type: input.type,
        value: args[input.name]
      },
      ...parameters
    }),
    {}
  )

  const availableHelpers = { ...defaultHelpers, ...userHelpers }

  // Get additional options
  const { from, to, value, data } = call.transaction

  // Evaluate expression with bindings from the transaction data
  return evaluateRaw(source, parameters, {
    ...options,
    availableHelpers,
    from,
    to,
    value,
    data
  })
}

export default evaluate
export { evaluate, evaluateRaw }

// Re-export some commonly used inner functionality
export { parse } from './parser'
export { scan } from './scanner'
