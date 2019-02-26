"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.evaluate = evaluate;
Object.defineProperty(exports, "evaluateRaw", {
  enumerable: true,
  get: function get() {
    return _lib.evaluateRaw;
  }
});
Object.defineProperty(exports, "parse", {
  enumerable: true,
  get: function get() {
    return _parser.parse;
  }
});
Object.defineProperty(exports, "scan", {
  enumerable: true,
  get: function get() {
    return _scanner.scan;
  }
});

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _web3EthAbi = _interopRequireDefault(require("web3-eth-abi"));

var _helpers = require("./helpers");

var _lib = require("./lib");

var _parser = require("./parser");

var _scanner = require("./scanner");

/**
 * @typedef {Object} Binding
 * @property {string} type The type of the binding (a valid Radspec type)
 * @property {*} value The value of the binding
 */

/**
 * @typedef {Object.<string, Binding>} Bindings
 */

/**
 * @module radspec
 */

/**
 * Evaluate a radspec expression (`source`) for a transaction (`call`)
 *
 * @example
 * import radspec from 'radspec'
 *
 * const expression = 'Will multiply `a` by 7 and return `a * 7`.'
 * const call = {
 *   abi: [{
 *     name: 'multiply',
 *     constant: false,
 *     type: 'function',
 *     inputs: [{
 *       name: 'a',
 *       type: 'uint256'
 *     }],
 *     outputs: [{
 *       name: 'd',
 *       type: 'uint256'
 *     }]
 *   }],
 *   transaction: {
 *     to: '0x8521742d3f456bd237e312d6e30724960f72517a',
 *     data: '0xc6888fa1000000000000000000000000000000000000000000000000000000000000007a'
 *   }
 * }
 *
 * radspec.evaluate(expression, call)
 *   .then(console.log) // => "Will multiply 122 by 7 and return 854."
 * @param {string} source The radspec expression
 * @param {Object} call The call that determines the bindings for this evaluation
 * @param {Array} call.abi The ABI used to decode the transaction data
 * @param {Object} call.transaction The transaction to decode for this evaluation
 * @param {string} call.transaction.to The destination address for this transaction
 * @param {string} call.transaction.data The transaction data
 * @param {?Object} options An options object
 * @param {?Web3} options.eth Web3 instance (used over options.ethNode)
 * @param {?string} options.ethNode The URL to an Ethereum node
 * @param {?Object} options.userHelpers User defined helpers
 * @return {Promise<string>} The result of the evaluation
 */
function evaluate(source, call, _ref = {}) {
  let {
    userHelpers = {}
  } = _ref,
      options = (0, _objectWithoutProperties2.default)(_ref, ["userHelpers"]);
  // Get method ID
  const methodId = call.transaction.data.substr(0, 10); // Find method ABI

  const method = call.abi.find(abi => abi.type === 'function' && methodId === _web3EthAbi.default.encodeFunctionSignature(abi)); // Decode parameters

  const parameterValues = _web3EthAbi.default.decodeParameters(method.inputs, '0x' + call.transaction.data.substr(10));

  const parameters = method.inputs.reduce((parameters, input) => Object.assign(parameters, {
    [input.name]: {
      type: input.type,
      value: parameterValues[input.name]
    }
  }), {});
  const availableHelpers = (0, _objectSpread2.default)({}, _helpers.defaultHelpers, userHelpers); // Evaluate expression with bindings from the transaction data

  return (0, _lib.evaluateRaw)(source, parameters, (0, _objectSpread2.default)({}, options, {
    availableHelpers,
    to: call.transaction.to
  }));
}
//# sourceMappingURL=index.js.map