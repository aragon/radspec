const ABI = require('web3-eth-abi')

class Evaluator {
  constructor (ast, bindings) {
    this.ast = ast
    this.bindings = bindings
  }

  async evaluateNodes (nodes) {
    return Promise.all(
      nodes.map(this.evaluateNode.bind(this))
    )
  }

  async evaluateNode (node) {
    if (node.type === 'ExpressionStatement') {
      return await this.evaluateNodes(node.body)
    }

    if (node.type === 'MonologueStatement') {
      return node.value
    }

    if (node.type === 'StringLiteral') {
      return node.value
    }

    if (node.type === 'NumberLiteral') {
      return node.value
    }

    if (node.type === 'BinaryExpression') {
      const left = await this.evaluateNode(node.left)
      const right = await this.evaluateNode(node.right)

      switch (node.operator) {
        case 'PLUS':
          return left + right
        case 'MINUS':
          return left - right
        case 'STAR':
          return left * right
        case 'SLASH':
          return left / right
        default:
          this.panic(`Undefined binary operator "${node.operator}"`)
      }
    }

    if (node.type === 'Identifier') {
      if (!this.bindings.hasOwnProperty(node.value)) {
        this.panic(`Undefined binding "${node.value}"`)
      }

      return this.bindings[node.value]
    }

    if (node.type === 'CallExpression') {
      const address = await this.evaluateNode(node.target)
      const inputs = await this.evaluateNodes(node.inputs)
      const outputs = await this.evaluateNode(node.outputs)
      const call = ABI.encodeFunctionCall({
        name: node.callee,
        type: 'function',

        inputs: inputs.map((input) => input.type),
        outputs: outputs.map((output) => output.type)
      }, call.inputs.map((input) => input.value))

      return `(${call} -> ${address})`
    }
  }

  async evaluate () {
    return this.evaluateNodes(
      this.ast.body
    ).then(
      (evaluatedNodes) => evaluatedNodes.join('')
    )
  }

  panic (msg) {
    throw new Error(`Error: ${msg}`)
  }
}

module.exports = {
  Evaluator,

  evaluate (ast, bindings) {
    return new Evaluator(ast, bindings).evaluate()
  }
}
