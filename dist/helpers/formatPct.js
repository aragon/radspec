"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _bn = _interopRequireDefault(require("bn.js"));

var _formatBN = require("./lib/formatBN");

var _default = () =>
/**
 * Format a percentage amount
 *
 * @param {*} value The number to be formatted as a percentage
 * @param {*} [base=10^18] The number that is considered to be 100% when calculating the percentage
 * @param {*} [precision=2] The number of decimal places to format to
 * @return {Promise<radspec/evaluator/TypedValue>}
 */
async (value, base = (0, _formatBN.tenPow)(18), precision = 2) => {
  const valueBn = new _bn.default(value);
  const baseBn = new _bn.default(base);
  const oneHundred = (0, _formatBN.tenPow)(2);
  const formattedAmount = (0, _formatBN.formatBN)(valueBn.mul(oneHundred), baseBn, Number(precision));
  return {
    type: 'string',
    value: `${formattedAmount}`
  };
};

exports.default = _default;
//# sourceMappingURL=formatPct.js.map