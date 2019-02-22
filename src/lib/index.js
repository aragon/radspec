const evaluator = require('../evaluator')
const parser = require('../parser')
const scanner = require('../scanner')

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
 * @param  {Bindings} bindings An object of bindings and their values
 * @param {?Object} evaluatorOptions An options object for the evaluator (see Evaluator)
 * @return {Promise<string>} The result of the evaluation
 */
function evaluateRaw (source, bindings, evaluatorOptions) {
  return scanner.scan(source)
    .then(parser.parse)
    .then((ast) => evaluator.evaluate(ast, bindings, evaluatorOptions))
}

module.exports = {
  evaluateRaw
}
