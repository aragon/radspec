/**
 * @module radspec/evaluator
 */

const ABI = require('web3-eth-abi')
const Eth = require('web3-eth')
const Web3Utils = require('web3-utils')
const BN = require('bn.js')
const types = require('../types')
const helpers = require('../helpers')

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

    if (types.isInteger(this.type) && !BN.isBN(this.value)) {
      this.value = new BN(this.value)
    }

    if (this.type === 'address') {
      const isChecksum = /[a-f]/.test(this.value)

      if (isChecksum && !Web3Utils.checkAddressChecksum(this.value)) {
        throw new Error(`Checksum failed for address "${this.value}"`)
      }
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
 * @param {?string} options.ethNode The URL to an Ethereum node
 * @param {?string} options.to The destination address for this expression's transaction
 * @property {radspec/parser/AST} ast
 * @property {radspec/Bindings} bindings
 */
class Evaluator {
  constructor (ast, bindings, { ethNode, to } = {}) {
    this.ast = ast
    this.bindings = bindings
    this.eth = new Eth(ethNode || 'https://mainnet.infura.io')
    this.to = to && new TypedValue('address', to)
  }

  /**
   * Evaluate an array of AST nodes.
   *
   * @param  {Array<radspec/parser/Node>} nodes
   * @return {Promise<Array<string>>}
   */
  async evaluateNodes (nodes) {
    return Promise.all(
      nodes.map(this.evaluateNode.bind(this))
    )
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
      return new TypedValue('string', node.value)
    }

    if (node.type === 'NumberLiteral') {
      return new TypedValue('int256', node.value)
    }

    if (node.type === 'BytesLiteral') {
      const length = (node.value.length - 2) / 2
      if (length > 32) {
        this.panic('Byte literal represents more than 32 bytes')
      }

      return new TypedValue(`bytes${length}`, node.value)
    }

    if (node.type === 'BinaryExpression') {
      const left = await this.evaluateNode(node.left)
      const right = await this.evaluateNode(node.right)

      // String concatenation
      if ((left.type === 'string' ||
        right.type === 'string') &&
        node.operator === 'PLUS') {
        return new TypedValue('string', left.value.toString() + right.value.toString())
      }

      // TODO Additionally check that the type is signed if subtracting
      if (!types.isInteger(left.type) ||
        !types.isInteger(right.type)) {
        this.panic(`Cannot evaluate binary expression "${node.operator}" for non-integer types "${left.type}" and "${right.type}"`)
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

      if (!types.isInteger(left.type) ||
        !types.isInteger(right.type)) {
        this.panic(`Cannot evaluate binary expression "${node.operator}" for non-integer types "${left.type}" and "${right.type}"`)
      }

      switch (node.operator) {
        case 'GREATER':
          return new TypedValue('bool', left.value.gt(right.value))
        case 'GREATER_EQUAL':
          return new TypedValue('bool', left.value.gte(right.value))
        case 'LESS':
          return new TypedValue('bool', left.value.lt(right.value))
        case 'LESS_EQUAL':
          return new TypedValue('bool', left.value.lte(right.value))
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

    if (node.type === 'Identifier') {
      if (!this.bindings.hasOwnProperty(node.value)) {
        this.panic(`Undefined binding "${node.value}"`)
      }

      const binding = this.bindings[node.value]
      return new TypedValue(binding.type, binding.value)
    }

    if (node.type === 'CallExpression') {
      // TODO Add a check for number of return values (can only be 1 for now)
      let target

      // Inject self
      if (node.target.type === 'Identifier' && node.target.value === 'self') {
        target = this.to
      } else {
        target = await this.evaluateNode(node.target)
      }

      if (target.type !== 'bytes20' &&
        target.type !== 'address') {
        this.panic('Target of call expression was not an address')
      } else if (!Web3Utils.checkAddressChecksum(target.value)) {
        this.panic(`Checksum failed for address "${target.value}"`)
      }

      const inputs = await this.evaluateNodes(node.inputs)
      const outputs = node.outputs

      const call = ABI.encodeFunctionCall({
        name: node.callee,
        type: 'function',

        inputs,
        outputs
      }, inputs.map((input) => input.value))

      const returnType = outputs[0].type
      return this.eth.call({
        to: target.value,
        data: call
      }).then(
        (data) => new TypedValue(returnType, ABI.decodeParameter(returnType, data))
      )
    }

    if (node.type === 'HelperFunction') {
      const helperName = node.name

      if (!helpers.exists(helperName)) {
        this.panic(`${helperName} helper function is not defined`)
      }

      const inputs = await this.evaluateNodes(node.inputs)
      const { type, value } = await helpers.execute(helperName, inputs)

      return new TypedValue(type, value)
    }
  }

  /**
   * Evaluate the entire AST.
   *
   * @return {string}
   */
  async evaluate () {
    return this.evaluateNodes(
      this.ast.body
    ).then(
      (evaluatedNodes) => evaluatedNodes.join('')
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

module.exports = {
  Evaluator,

  /**
   * Evaluates an AST
   *
   * @memberof radspec/evaluator
   * @param {radspec/parser/AST} ast The AST to evaluate
   * @param {radspec/Bindings} bindings An object of bindings and their values
   * @param {?Object} options An options object
   * @param {?string} options.ethNode The URL to an Ethereum node
   * @param {?string} options.to The destination address for this expression's transaction
   * @return {string}
   */
  evaluate (ast, bindings, options) {
    return new Evaluator(ast, bindings, options).evaluate()
  }
}
