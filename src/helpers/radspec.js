const ABI = require('web3-eth-abi')
const { keccak256 } = require('web3-utils')

const getSig = (fn) =>
  keccak256(fn).substr(0, 10)

const processFunctions = (functions) => (
  Object.keys(functions).reduce(
    (acc, key) => (
      {
        [getSig(key)]: { source: functions[key], sig: key },
        ...acc
      }
  ), {})
)

module.exports = (eth) =>
  /**
   * Evaluate a known radspec string
   *
   * @param {address} addr The target address of the call
   * @param {bytes} data The calldata of the call
   * @return {Promise<radspec/evaluator/TypedValue>}
   */
  async (addr, data) => {
    // lazily import radspec to avoid a dependency cycle
    const { evaluateRaw } = require('../index')
    const functions = processFunctions(require('../data/knownFunctions'))

    // Get method ID
    const methodId = data.substr(0, 10)
    const fn = functions[methodId]

    if (!fn) {
      return { 
        type: 'string',
        value: `Unknown (${methodId})`
      }
    }

    const { source, sig } = fn

    // get the array of input types from the function signature 
    const inputs = sig.replace(')', '').split('(')[1].split(',')
    
    // Decode parameters
    const parameterValues = ABI.decodeParameters(inputs, '0x' + data.substr(10))
    const parameters = inputs.reduce((acc, input, i) => (
      {
        [`$${i+1}`]: {
          type: input,
          value: parameterValues[i]
        },
        ...acc
    }), {})
    
    return {
      type: 'string',
      value: await evaluateRaw(source, parameters, { to: addr, eth })
    }
  }
