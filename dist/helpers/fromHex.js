"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _web3Utils = require("web3-utils");

var _default = () =>
/**
 * Returns the string representation of a given hex value
 *
 * @param {string} hex The hex string
 * @param {string} [to='utf8'] The type to convert the hex from (supported types: 'utf8', 'number', 'decimal')
 * @return {radspec/evaluator/TypedValue}
 */
(hex, to = 'utf8') => ({
  type: 'string',
  value: to === 'utf8' ? (0, _web3Utils.toUtf8)(hex) : to === 'ascii' ? (0, _web3Utils.toAscii)(hex) : (0, _web3Utils.toDecimal)(hex)
});

exports.default = _default;
//# sourceMappingURL=fromHex.js.map