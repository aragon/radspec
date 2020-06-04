import { ethers } from 'ethers'

import MethodRegistry from './lib/methodRegistry'
import { evaluateRaw } from '../lib/'
import { knownFunctions } from '../data/'

const makeUnknownFunctionNode = (methodId) => ({
  type: 'string',
  value: `Unknown function (${methodId})`
})

const getSig = (fn) =>
  ethers.utils.keccak256(ethers.utils.toUtf8Bytes(fn)).substr(0, 10)

// Convert from the knownFunctions data format into the needed format
// Input: { "signature(type1,type2)": "Its radspec string", ... }
// Output: { "0xabcdef12": { "sig": "signature(type1,type2)", "source": "Its radspec string" }, ...}
const processFunctions = (functions) =>
  Object.keys(functions).reduce(
    (acc, key) => ({
      [getSig(key)]: { source: functions[key], sig: key },
      ...acc
    }),
    {}
  )

export default (provider, evaluator) =>
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

    if (data.length < 10) {
      return makeUnknownFunctionNode(data)
    }

    // Get method ID
    const methodId = data.substr(0, 10)
    const fn = functions[methodId]

    // If function is not a known function, execute fallback checking Parity's on-chain signature registry
    if (!fn) {
      // Even if we pass the ETH object, if it is not on mainnet it will use Aragon's ETH mainnet node
      // As the registry is the only available on mainnet
      const registry = new MethodRegistry({ networkId: '1', provider })

      try {
        const result = await registry.lookup(methodId)
        const { name } = registry.parse(result)
        return {
          type: 'string',
          value: name // TODO: should we decode and print the arguments as well?
        }
      } catch {
        return makeUnknownFunctionNode(methodId)
      }
    }
    // If the function was found in local radspec registry. Decode and evaluate.
    const { source, sig } = fn

    const fragment = ethers.utils.FunctionFragment.from(sig)

    const ethersInterface = new ethers.utils.Interface([fragment])

    // Decode parameters
    const args = ethersInterface.decodeFunctionData(fragment.name, data)

    const parameters = fragment.inputs.reduce(
      (parameters, input, index) =>
        Object.assign(parameters, {
          [`$${index + 1}`]: {
            type: input.type,
            value: args[index]
          }
        }),
      {}
    )

    return {
      type: 'string',
      value: await evaluateRaw(source, parameters, {
        provider,
        availableHelpers: evaluator.helpers.getHelpers(),
        to: addr
      })
    }
  }
