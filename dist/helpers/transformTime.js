"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _addMilliseconds = _interopRequireDefault(require("date-fns/addMilliseconds"));

var _addSeconds = _interopRequireDefault(require("date-fns/addSeconds"));

var _addMinutes = _interopRequireDefault(require("date-fns/addMinutes"));

var _addHours = _interopRequireDefault(require("date-fns/addHours"));

var _addDays = _interopRequireDefault(require("date-fns/addDays"));

var _addWeeks = _interopRequireDefault(require("date-fns/addWeeks"));

var _addMonths = _interopRequireDefault(require("date-fns/addMonths"));

var _addYears = _interopRequireDefault(require("date-fns/addYears"));

var _formatDistanceStrict = _interopRequireDefault(require("date-fns/formatDistanceStrict"));

const BEST_UNIT = 'best';
const ADD_UNIT_FN = new Map([['millisecond', _addMilliseconds.default], ['second', _addSeconds.default], ['minute', _addMinutes.default], ['hour', _addHours.default], ['day', _addDays.default], ['week', _addWeeks.default], ['month', _addMonths.default], ['year', _addYears.default]]);
const DISALLOWED_FROM_UNITS = new Set(['millisecond']);

var _default = () =>
/**
 * Transform between time units.
 *
 * @param {*} time The base time amount
 * @param {string} [toUnit] The unit to convert the time to (supported units: 'second', 'minute', 'hour', 'day', 'week', 'month', 'year')
 *                          Defaults to using the "best" unit
 * @param {string} [fromUnit='second'] The unit to convert the time from (supported units: 'millisecond', 'second', 'minute', 'hour', 'day', 'week', 'month', 'year')
 * @return {Promise<radspec/evaluator/TypedValue>}
 */
async (time, toUnit = BEST_UNIT, fromUnit = 'second') => {
  if (DISALLOWED_FROM_UNITS.has(fromUnit) || !ADD_UNIT_FN.has(fromUnit)) {
    throw new Error(`@transformTime: Time unit '${fromUnit}' is not supported as a fromUnit`);
  }

  if (toUnit !== BEST_UNIT && !ADD_UNIT_FN.has(toUnit)) {
    throw new Error(`@transformTime: Time unit '${toUnit}' is not supported as a toUnit`);
  }

  const addTime = ADD_UNIT_FN.get(fromUnit);
  const zeroDate = new Date(0);
  const duration = addTime(zeroDate, Number(time));
  return {
    type: 'string',
    value: (0, _formatDistanceStrict.default)(zeroDate, duration, toUnit !== BEST_UNIT ? {
      unit: toUnit
    } : {})
  };
};

exports.default = _default;
//# sourceMappingURL=transformTime.js.map