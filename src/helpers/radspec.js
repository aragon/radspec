import { ethers } from 'ethers'

import MethodRegistry from './lib/methodRegistry'
import { evaluateRaw } from '../lib/'
import { knownFunctions } from '../data/'
import { DEFAULT_API_4BYTES } from '../defaults'

const makeUnknownFunctionNode = (methodId) => ({
  type: 'string',
  value: `Unknown function (${methodId})`
})

const parse = (signature) => {
  const fragment = ethers.utils.FunctionFragment.from(signature)

  return {
    name:
      fragment.name.charAt(0).toUpperCase() +
      fragment.name
        .slice(1)
        .split(/(?=[A-Z])/)
        .join(' '),
    args: fragment.inputs.map((input) => {
      return { type: input.type }
    })
  }
}

// Hash signature with Ethereum Identity and silce bytes
const getSigHah = (sig) => ethers.utils.hexDataSlice(ethers.utils.id(sig), 0, 4)

// Convert from the knownFunctions data format into the needed format
// Input: { "signature(type1,type2)": "Its radspec string", ... }
// Output: { "0xabcdef12": { "fragment": FunctionFragment, "source": "Its radspec string" }, ...}
const processFunctions = (functions) =>
  Object.keys(functions).reduce((acc, key) => {
    const fragment = ethers.utils.FunctionFragment.from(key)
    return {
      [getSigHah(fragment.format())]: { source: functions[key], fragment },
      ...acc
    }
  }, {})

export default (provider, evaluator) =>
  /**
   * Interpret calldata using radspec recursively. If the function signature is not in the package's known
   * functions, it fallbacks to looking for the function name using github.com/parity-contracts/signature-registry
   *
   * @param {address} addr The target address of the call
   * @param {bytes} data The calldata of the call
   * @param {string} [registryAddress] The registry address to lookup descriptions
   * @return {Promise<radspec/evaluator/TypedValue>}
   */
  async (addr, data, registryAddress) => {
    const functions = processFunctions(knownFunctions)

    if (data.length < 10) {
      return makeUnknownFunctionNode(data)
    }

    // Get method ID
    const methodId = data.substr(0, 10)
    const fn = functions[methodId]

    // If function is not a known function
    if (!fn) {
      try {
        // Try checking on-chain signature registry
        const registry = new MethodRegistry({
          registryAddress,
          provider,
          network: registryAddress
            ? undefined
            : (await provider.getNetwork()).chainId
        })
        const result = await registry.lookup(methodId)
        const { name } = parse(result)
        return {
          type: 'string',
          value: name // TODO: should we decode and print the arguments as well?
        }
      } catch {
        // Try fetching 4bytes API
        const { results } = await ethers.utils.fetchJson(
          `${DEFAULT_API_4BYTES}?hex_signature=${methodId}`
        )
        if (Array.isArray(results) && results.length > 0) {
          const { name } = parse(results[0].text_signature)
          return {
            type: 'string',
            value: name
          }
        }
        // Fallback to unknown function
        return makeUnknownFunctionNode(methodId)
      }
    }
    // If the function was found in local radspec registry. Decode and evaluate.
    const { source, fragment } = fn

    const ethersInterface = new ethers.utils.Interface([fragment])

    // Decode parameters
    const args = ethersInterface.decodeFunctionData(fragment.name, data)

    const parameters = fragment.inputs.reduce(
      (parameters, input, index) => ({
        [`$${index + 1}`]: {
          type: input.type,
          value: args[index]
        },
        ...parameters
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
