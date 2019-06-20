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
import ABI from 'web3-eth-abi'
import MetadataDAO from 'metadata-dao'
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
 *   abi: [{
 *     name: 'multiply',
 *     constant: false,
 *     type: 'function',
 *     inputs: [{
 *       name: 'a',
 *       type: 'uint256'
 *     }],
 *     outputs: [{
 *       name: 'd',
 *       type: 'uint256'
 *     }]
 *   }],
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
 * @param {?Web3} options.eth Web3 instance (used over options.ethNode)
 * @param {?string} options.ethNode The URL to an Ethereum node
 * @param {?Object} options.userHelpers User defined helpers
 * @return {Promise<string>} The result of the evaluation
 */
function evaluate (source, call, { userHelpers = {}, ...options } = {}) {
  // Get method ID
  const methodId = call.transaction.data.substr(0, 10)

  // Find method ABI
  const method = call.abi.find((abi) =>
    abi.type === 'function' &&
    methodId === ABI.encodeFunctionSignature(abi))

  // Decode parameters
  const parameterValues = ABI.decodeParameters(
    method.inputs,
    '0x' + call.transaction.data.substr(10)
  )
  const parameters = method.inputs.reduce((parameters, input) =>
    Object.assign(
      parameters, {
        [input.name]: {
          type: input.type,
          value: parameterValues[input.name]
        }
      }
    ), {})

  const availableHelpers = { ...defaultHelpers, ...userHelpers }

  // Evaluate expression with bindings from the transaction data
  return evaluateRaw(
    source,
    parameters,
    {
      ...options,
      availableHelpers,
      to: call.transaction.to
    }
  )
}

async function evaluateWithRegistry (call, { userHelpers = {}, ...options } = {}) {
  const metadataDAO = new MetadataDAO()

  // Get method ID
  const { to, data } = call.transaction
  const methodId = data.substr(0, 10)

  const fn = await metadataDAO.query('radspec', 'sig', methodId)

  if (!fn) {
    return null
  }

  // If the function was found in local radspec registry. Decode and evaluate.
  const { notice: source, signature: sig } = fn

  // get the array of input types from the function signature
  const inputString = sig.replace(')', '').split('(')[1]

  let parameters = []

  // If the function has parameters
  if (inputString !== '') {
    const inputs = inputString.split(',')

    // Decode parameters
    const parameterValues = ABI.decodeParameters(inputs, '0x' + data.substr(10))
    parameters = inputs.reduce((acc, input, i) => (
      {
        [`$${i + 1}`]: {
          type: input,
          value: parameterValues[i]
        },
        ...acc
      }), {})
  }

  const availableHelpers = { ...defaultHelpers, ...userHelpers }

  return await evaluateRaw(
    source,
    parameters,
    {
      ...options,
      availableHelpers,
      to: call.transaction.to
    }
  )
}

export default evaluate
export { evaluate, evaluateRaw, evaluateWithRegistry }

// Re-export some commonly used inner functionality
export { parse } from './parser'
export { scan } from './scanner'

