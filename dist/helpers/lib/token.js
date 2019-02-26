"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ERC20_SYMBOL_DECIMALS_ABI = exports.ERC20_SYMBOL_BYTES32_ABI = exports.ETH = void 0;
const ETH = '0x0000000000000000000000000000000000000000';
/* eslint-disable key-spacing, quotes */

exports.ETH = ETH;
const ERC20_SYMBOL_BYTES32_ABI = [{
  "constant": true,
  "inputs": [],
  "name": "symbol",
  "outputs": [{
    "name": "",
    "type": "bytes32"
  }],
  "payable": false,
  "stateMutability": "view",
  "type": "function"
}];
exports.ERC20_SYMBOL_BYTES32_ABI = ERC20_SYMBOL_BYTES32_ABI;
const ERC20_SYMBOL_DECIMALS_ABI = [{
  "constant": true,
  "inputs": [],
  "name": "decimals",
  "outputs": [{
    "name": "",
    "type": "uint8"
  }],
  "payable": false,
  "stateMutability": "view",
  "type": "function"
}, {
  "constant": true,
  "inputs": [],
  "name": "symbol",
  "outputs": [{
    "name": "",
    "type": "string"
  }],
  "payable": false,
  "stateMutability": "view",
  "type": "function"
}];
/* eslint-enable key-spacing, quotes */

exports.ERC20_SYMBOL_DECIMALS_ABI = ERC20_SYMBOL_DECIMALS_ABI;
//# sourceMappingURL=token.js.map