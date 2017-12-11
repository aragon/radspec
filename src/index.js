/**
 * @module radspec
 */
const ABI = require('web3-eth-abi')
const { scan } = require('./scanner')
const { parse } = require('./parser')

module.exports = {
  scan,
  parse,

  /**
   * Evaluate a radspec expression with manual bindings.
   *
   * @example
   * const radspec = require('radspec')
   *
   * radspec.evaluateRaw('a is `a`', {
   *   a: { type: 'int256', value: 10 }
   * }).then(console.log)
   * @param  {string} source The radspec expression
   * @param  {object} bindings An object of bindings and their values
   * @return {Promise<string>} The result of the evaluation
   */
  evaluateRaw (source, bindings) {
    return scan(source)
      .then(parse)
      .then((ast) => evaluate(ast, bindings))
  },

  /**
   * Evaluate a radspec expression (`source`) for a transaction (`call`)
   *
   * @param {string} source The radspec expression
   * @param {Object} call The call that determines the bindings for this evaluation
   * @param {Array} call.abi The ABI used to decode the transaction data
   * @param {Object} call.transaction The transaction to decode for this evaluation
   * @param {string} call.transaction.to The destination address for this transaction
   * @param {string} call.transaction.data The transaction data
   * @return {Promise<string>} The result of the evaluation
   */
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
