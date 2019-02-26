"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.evaluateRaw = evaluateRaw;

var _evaluator = require("../evaluator");

var _parser = require("../parser");

var _scanner = require("../scanner");

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
function evaluateRaw(source, bindings, evaluatorOptions) {
  return (0, _scanner.scan)(source).then(_parser.parse).then(ast => (0, _evaluator.evaluate)(ast, bindings, evaluatorOptions));
}
//# sourceMappingURL=index.js.map