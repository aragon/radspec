import { evaluate } from '../evaluator'
import { parse } from '../parser'
import { scan } from '../scanner'

/**
 * Evaluate a radspec expression with manual bindings.
 *
 * @example
 * import radspec from 'radspec'
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
  return scan(source)
    .then(parse)
    .then((ast) => evaluate(ast, bindings, evaluatorOptions))
}

export {
  evaluateRaw
}
