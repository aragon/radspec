"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ethers = require("ethers");

var _defaults = require("../../defaults");

// From: https://github.com/danfinlay/eth-method-registry

/* eslint-disable key-spacing, quotes */
const REGISTRY_LOOKUP_ABI = [{
  constant: true,
  inputs: [{
    name: '',
    type: 'bytes4'
  }],
  name: 'entries',
  outputs: [{
    name: '',
    type: 'string'
  }],
  payable: false,
  type: 'function'
}]; // networkId -> registry address

const REGISTRY_MAP = {
  1: '0x44691B39d1a75dC4E0A0346CBB15E310e6ED1E86'
};

class MethodRegistry {
  constructor({
    provider,
    networkId
  } = {}) {
    this.networkId = networkId || 1;
    this.provider = provider || new _ethers.ethers.providers.JsonRpcProvider(_defaults.DEFAULT_ETH_NODE, this.networkId);
  }

  async initRegistry() {
    if ((await this.provider.getNetwork()).chainId !== 1) {
      this.provider = new _ethers.ethers.providers.JsonRpcProvider(_defaults.DEFAULT_ETH_NODE, 1);
    }

    const address = REGISTRY_MAP[this.networkId];

    if (!address) {
      throw new Error('No method registry found on the requested network.');
    }

    this.registry = new _ethers.ethers.Contract(address, REGISTRY_LOOKUP_ABI, this.provider);
  }

  async lookup(sigBytes) {
    if (!this.registry) {
      await this.initRegistry();
    }

    return this.registry.functions.entries(sigBytes);
  }

  parse(signature) {
    // TODO: Throw if there are unknown types in the signature or there if is any chars after the closing parenthesis
    let name = signature.match(/^.+(?=\()/)[0];
    name = name.charAt(0).toUpperCase() + name.slice(1).split(/(?=[A-Z])/).join(' ');
    const args = signature.match(/\(.+\)/)[0].slice(1, -1).split(',');
    return {
      name,
      args: args.map(arg => {
        return {
          type: arg
        };
      })
    };
  }

}

exports.default = MethodRegistry;
//# sourceMappingURL=methodRegistry.js.map