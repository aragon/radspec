/**
 * @module radspec/evaluator
 */

import { BigNumber, providers as ethersProvider, utils as ethersUtils } from 'ethers'

import types from '../types'
import HelperManager from '../helpers/HelperManager'
import { DEFAULT_ETH_NODE } from '../defaults'

/**
 * A value coupled with a type
 *
 * @class TypedValue
 * @param {string} type The type of the value
 * @param {*} value The value
 * @property {string} type
 * @property {*} value
 */
class TypedValue {
  constructor (type, value) {
    this.type = type
    this.value = value

    if (types.isInteger(this.type) && !BigNumber.isBigNumber(this.value)) {
      this.value = BigNumber.from(this.value)
    }

    if (this.type === 'address') {
      if (!ethersUtils.isAddress(this.value)) {
        throw new Error(`Invalid address "${this.value}"`)
      }
      this.value = ethersUtils.getAddress(this.value)
    }
  }

  /**
   * Get the string representation of the wrapped value
   *
   * @return {string}
   */
  toString () {
    return this.value.toString()
  }
}

/**
 * Walks an AST and evaluates each node.
 *
 * @class Evaluator
 * @param {radspec/parser/AST} ast The AST to evaluate
 * @param {radspec/Bindings} bindings An object of bindings and their values
 * @param {?Object} options An options object
 * @param {?Object} options.availablehelpers Available helpers
 * @param {?Object} options.availableFunctions Available function signatures
 * @param {?ethersProvider.Provider} options.provider EIP 1193 provider
 * @param {?string} options.to The destination address for this expression's transaction
 * @property {radspec/parser/AST} ast
 * @property {radspec/Bindings} bindings
 */
export class Evaluator {
  constructor (
    ast,
    bindings,
    { availableHelpers = {}, availableFunctions = {}, provider, from, to, value = '0', data } = {}
  ) {
    this.ast = ast
    this.bindings = bindings
    this.provider =
      provider || new ethersProvider.WebSocketProvider(DEFAULT_ETH_NODE)
    this.from = from && new TypedValue('address', from)
    this.to = to && new TypedValue('address', to)
    this.value = new TypedValue('uint', BigNumber.from(value))
    this.data = data && new TypedValue('bytes', data)
    this.helpers = new HelperManager(availableHelpers)
    this.functions = availableFunctions
  }

  /**
   * Evaluate an array of AST nodes.
   *
   * @param  {Array<radspec/parser/Node>} nodes
   * @return {Promise<Array<string>>}
   */
  async evaluateNodes (nodes) {
    return Promise.all(nodes.map(this.evaluateNode.bind(this)))
  }

  /**
   * Evaluate a single node.
   *
   * @param  {radspec/parser/Node} node
   * @return {Promise<string>}
   */
  async evaluateNode (node) {
    if (node.type === 'ExpressionStatement') {
      return (await this.evaluateNodes(node.body)).join(' ')
    }

    if (node.type === 'GroupedExpression') {
      return this.evaluateNode(node.body)
    }

    if (node.type === 'MonologueStatement') {
      return new TypedValue('string', node.value)
    }

    if (node.type === 'StringLiteral') {
      return new TypedValue('string', node.value || '')
    }

    if (node.type === 'NumberLiteral') {
      return new TypedValue('int256', node.value)
    }

    if (node.type === 'BytesLiteral') {
      const length = Math.ceil((node.value.length - 2) / 2)
      if (length > 32) {
        this.panic('Byte literal represents more than 32 bytes')
      }

      return new TypedValue(`bytes${length}`, node.value)
    }

    if (node.type === 'BoolLiteral') {
      return new TypedValue('bool', node.value === 'true')
    }

    if (node.type === 'BinaryExpression') {
      const left = await this.evaluateNode(node.left)
      const right = await this.evaluateNode(node.right)

      // String concatenation
      if (
        (left.type === 'string' || right.type === 'string') &&
        node.operator === 'PLUS'
      ) {
        return new TypedValue(
          'string',
          left.value.toString() + right.value.toString()
        )
      }

      // TODO Additionally check that the type is signed if subtracting
      if (!types.isInteger(left.type) || !types.isInteger(right.type)) {
        this.panic(
          `Cannot evaluate binary expression "${node.operator}" for non-integer types "${left.type}" and "${right.type}"`
        )
      }

      switch (node.operator) {
        case 'PLUS':
          return new TypedValue('int256', left.value.add(right.value))
        case 'MINUS':
          return new TypedValue('int256', left.value.sub(right.value))
        case 'STAR':
          return new TypedValue('int256', left.value.mul(right.value))
        case 'POWER':
          return new TypedValue('int256', left.value.pow(right.value))
        case 'SLASH':
          return new TypedValue('int256', left.value.div(right.value))
        case 'MODULO':
          return new TypedValue('int256', left.value.mod(right.value))
        default:
          this.panic(`Undefined binary operator "${node.operator}"`)
      }
    }

    if (node.type === 'ComparisonExpression') {
      const left = await this.evaluateNode(node.left)
      const right = await this.evaluateNode(node.right)

      let leftValue = left.value
      let rightValue = right.value

      const bothTypesAddress = (left, right) =>
        // isAddress is true if type is address or bytes with size less than 20
        types.isAddress(left.type) && types.isAddress(right.type)

      const bothTypesBytes = (left, right) =>
        types.types.bytes.isType(left.type) &&
        types.types.bytes.isType(right.type)

      // Conversion to BigNumber for comparison will happen if:
      // - Both types are addresses or bytes of any size (can be different sizes)
      // - If one of the types is an address and the other bytes with size less than 20
      if (bothTypesAddress(left, right) || bothTypesBytes(left, right)) {
        leftValue = BigNumber.from(leftValue)
        rightValue = BigNumber.from(rightValue)
      } else if (!types.isInteger(left.type) || !types.isInteger(right.type)) {
        this.panic(
          `Cannot evaluate binary expression "${node.operator}" for non-integer or fixed-size bytes types "${left.type}" and "${right.type}"`
        )
      }

      switch (node.operator) {
        case 'GREATER':
          return new TypedValue('bool', leftValue.gt(rightValue))
        case 'GREATER_EQUAL':
          return new TypedValue('bool', leftValue.gte(rightValue))
        case 'LESS':
          return new TypedValue('bool', leftValue.lt(rightValue))
        case 'LESS_EQUAL':
          return new TypedValue('bool', leftValue.lte(rightValue))
        case 'EQUAL_EQUAL':
          return new TypedValue('bool', leftValue.eq(rightValue))
        case 'BANG_EQUAL':
          return new TypedValue('bool', !leftValue.eq(rightValue))
      }
    }

    if (node.type === 'TernaryExpression') {
      if ((await this.evaluateNode(node.predicate)).value) {
        return this.evaluateNode(node.left)
      }

      return this.evaluateNode(node.right)
    }

    if (node.type === 'DefaultExpression') {
      const left = await this.evaluateNode(node.left)
      let leftFalsey

      if (types.isInteger(left.type)) {
        leftFalsey = left.value.isZero()
      } else if (left.type === 'address' || left.type.startsWith('bytes')) {
        leftFalsey = /^0x[0]*$/.test(left.value)
      } else {
        leftFalsey = !left.value
      }

      return leftFalsey ? this.evaluateNode(node.right) : left
    }

    if (node.type === 'CallExpression') {
      let target

      // Inject self
      if (node.target.type === 'Identifier' && node.target.value === 'self') {
        target = this.to
      } else {
        target = await this.evaluateNode(node.target)
      }

      if (target.type !== 'bytes20' && target.type !== 'address') {
        this.panic('Target of call expression was not an address')
      } else if (!ethersUtils.isAddress(target.value)) {
        this.panic(`Invalid address "${this.value}"`)
      }

      const inputs = await this.evaluateNodes(node.inputs)
      const outputs = node.outputs
      const selectedReturnValueIndex = outputs.findIndex(
        (output) => output.selected
      )
      if (selectedReturnValueIndex === -1) {
        this.panic(
          `No selected return value for function call "${node.callee}"`
        )
      }
      const returnType = outputs[selectedReturnValueIndex].type

      const abi = [
        {
          name: node.callee,
          type: 'function',
          inputs: inputs.map(({ type }) => ({
            type
          })),
          outputs: outputs.map(({ type }) => ({
            type
          })),
          stateMutability: 'view'
        }
      ]
      const ethersInterface = new ethersUtils.Interface(abi)

      const txData = ethersInterface.encodeFunctionData(
        node.callee,
        inputs.map((input) => input.value.toString())
      )

      const data = await this.provider.call({
        to: target.value,
        data: txData
      })

      const decodeData = ethersInterface.decodeFunctionResult(node.callee, data)

      return new TypedValue(returnType, decodeData[selectedReturnValueIndex])
    }

    if (node.type === 'HelperFunction') {
      const helperName = node.name

      if (!this.helpers.exists(helperName)) {
        this.panic(`${helperName} helper function is not defined`)
      }

      const inputs = await this.evaluateNodes(node.inputs)
      const result = await this.helpers.execute(helperName, inputs, {
        provider: this.provider,
        evaluator: this,
        functions: this.functions
      })

      return new TypedValue(result.type, result.value)
    }

    if (
      node.type === 'PropertyAccessExpression' &&
      node.target.value === 'msg'
    ) {
      if (node.property === 'value') {
        return this.value
      }

      if (node.property === 'sender') {
        return this.from
      }

      if (node.property === 'data') {
        return this.data
      }

      this.panic(
        `Expecting value, sender or data property for msg identifier but got: ${node.property}`
      )
    }

    if (node.type === 'Identifier') {
      if (node.value === 'self') {
        return this.to
      }

      if (!this.bindings.hasOwnProperty(node.value)) {
        this.panic(`Undefined binding "${node.value}"`)
      }

      const binding = this.bindings[node.value]
      return new TypedValue(binding.type, binding.value)
    }
  }

  /**
   * Evaluate the entire AST.
   *
   * @return {string}
   */
  async evaluate () {
    return this.evaluateNodes(this.ast.body).then((evaluatedNodes) =>
      evaluatedNodes.join('')
    )
  }

  /**
   * Report an error and abort evaluation.
   *
   * @param  {string} msg
   */
  panic (msg) {
    throw new Error(`Error: ${msg}`)
  }
}

/**
 * Evaluates an AST
 *
 * @memberof radspec/evaluator
 * @param {radspec/parser/AST} ast The AST to evaluate
 * @param {radspec/Bindings} bindings An object of bindings and their values
 * @param {?Object} options An options object
 * @param {?Object} options.availablehelpers Available helpers
 * @param {?Object} options.availableFunctions Available function signatures
 * @param {?ethersProvider.Provider} options.provider EIP 1193 provider
 * @param {?string} options.to The destination address for this expression's transaction
 * @return {string}
 */
export function evaluate (ast, bindings, options) {
  return new Evaluator(ast, bindings, options).evaluate()
}
