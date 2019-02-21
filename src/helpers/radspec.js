const ABI = require('web3-eth-abi')
const { keccak256 } = require('web3-utils')
const MethodRegistry = require('./lib/methodRegistry')
const { evaluateRaw } = require('../lib/')
const knownFunctions = require('../data/knownFunctions')

const getSig = (fn) =>
  keccak256(fn).substr(0, 10)

// Convert from the knownFunctions data format into the needed format
// Input: { "signature(type1,type2)": "Its radspec string", ... }
// Output: { "0xabcdef12": { "sig": "signature(type1,type2)", "source": "Its radspec string" }, ...}
const processFunctions = (functions) => (
  Object.keys(functions).reduce(
    (acc, key) => (
      {
        [getSig(key)]: { source: functions[key], sig: key },
        ...acc
      }
    ), {})
)
module.exports = (eth, evaluator) =>
  /**
   * Interpret calldata using radspec recursively. If the function signature is not in the package's known
   * functions, it fallbacks to looking for the function name using github.com/parity-contracts/signature-registry
   *
   * @param {address} addr The target address of the call
   * @param {bytes} data The calldata of the call
   * @return {Promise<radspec/evaluator/TypedValue>}
   */
  async (addr, data) => {
    const functions = processFunctions(knownFunctions)

    // Get method ID
    const methodId = data.substr(0, 10)
    const fn = functions[methodId]

    // If function is not a known function, execute fallback checking Parity's on-chain signature registry
    if (!fn) {
      // Even if we pass the ETH object, if it is not on mainnet it will use Aragon's ETH mainnet node
      // As the registry is the only available on mainnet
      const registry = new MethodRegistry({ networkId: '1', eth })
      const result = await registry.lookup(methodId)

      if (result) {
        const { name } = registry.parse(result)
        return {
          type: 'string',
          value: name // TODO: should we decode and print the arguments as well?
        }
      } else {
        return {
          type: 'string',
          value: `Unknown function (${methodId})`
        }
      }
    }
    // If the function was found in local radspec registry. Decode and evaluate.
    const { source, sig } = fn

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

    return {
      type: 'string',
      value: await evaluateRaw(
        source,
        parameters,
        {
          eth,
          availableHelpers: evaluator.helpers.getHelpers(),
          to: addr
        }
      )
    }
  }
