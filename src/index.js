const ABI = require('web3-eth-abi')
const { scan } = require('./scanner')
const { parse } = require('./parser')
const { evaluate } = require('./evaluator')

module.exports = {
  scan,
  parse,
  evaluate,

  evaluateRaw (source, bindings) {
    return scan(source)
      .then(parse)
      .then((ast) => evaluate(ast, bindings))
  },

  evaluate (source, call) {
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

    // Evaluate expression with bindings from
    // the transaction data
    return this.evaluateRaw(source, parameters)
  }
}
