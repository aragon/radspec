"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _bn = _interopRequireDefault(require("bn.js"));

var _web3Utils = require("web3-utils");

var _token = require("./lib/token");

var _formatBN = require("./lib/formatBN");

var _default = eth =>
/**
 * Format token amounts taking decimals into account
 *
 * @param {string} tokenAddress The address of the token
 * @param {*} amount The absolute amount for the token quantity (wei)
 * @param {bool} showSymbol Whether the token symbol will be printed after the amount
 * @param {*} [precision=2] The number of decimal places to format to
 * @return {Promise<radspec/evaluator/TypedValue>}
 */
async (tokenAddress, amount, showSymbol = true, precision = 2) => {
  const amountBn = new _bn.default(amount);
  let decimals;
  let symbol;

  if (tokenAddress === _token.ETH) {
    decimals = new _bn.default(18);

    if (showSymbol) {
      symbol = 'ETH';
    }
  } else {
    let token = new eth.Contract(_token.ERC20_SYMBOL_DECIMALS_ABI, tokenAddress);
    decimals = new _bn.default((await token.methods.decimals().call()));

    if (showSymbol) {
      try {
        symbol = (await token.methods.symbol().call()) || '';
      } catch (err) {
        // Some tokens (e.g. DS-Token) use bytes32 for their symbol()
        token = new eth.Contract(_token.ERC20_SYMBOL_BYTES32_ABI, tokenAddress);
        symbol = (await token.methods.symbol().call()) || '';
        symbol = symbol && (0, _web3Utils.toUtf8)(symbol);
      }
    }
  }

  const formattedAmount = (0, _formatBN.formatBN)(amountBn, (0, _formatBN.tenPow)(decimals), Number(precision));
  return {
    type: 'string',
    value: showSymbol ? `${formattedAmount} ${symbol}` : formattedAmount
  };
};

exports.default = _default;
//# sourceMappingURL=tokenAmount.js.map