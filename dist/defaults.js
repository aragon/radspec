"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.abiCoder = exports.DEFAULT_ETH_NODE = void 0;

var _web3EthAbi = require("web3-eth-abi");

const DEFAULT_ETH_NODE = 'https://mainnet.eth.aragon.network';
exports.DEFAULT_ETH_NODE = DEFAULT_ETH_NODE;
const abiCoder = new _web3EthAbi.AbiCoder();
exports.abiCoder = abiCoder;
//# sourceMappingURL=defaults.js.map