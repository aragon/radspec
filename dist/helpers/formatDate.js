"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _format = _interopRequireDefault(require("date-fns/format"));

var _default = () =>
/**
 * Format a timestamp as a string
 *
 * @param {*} timestamp Unix timestamp in seconds
 * @param {string} [format='MMM. do y'] Format for the date, defaults to a format like "Jan. 1st 2000"
 *                                      Uses unicode TR35 symbols; see https://date-fns.org/v2.0.0-alpha.22/docs/format
 * @return {Promise<radspec/evaluator/TypedValue>}
 */
async (timestamp, format = 'MMM. do y') => ({
  type: 'string',
  value: (0, _format.default)(new Date(Number(timestamp) * 1000), format)
});

exports.default = _default;
//# sourceMappingURL=formatDate.js.map