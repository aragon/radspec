// From: https://github.com/danfinlay/eth-method-registry

import Eth from 'web3-eth'
import { DEFAULT_ETH_NODE } from '../../defaults'

/* eslint-disable key-spacing, quotes */
const REGISTRY_LOOKUP_ABI = [
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "bytes4"
      }
    ],
    "name": "entries",
    "outputs":
    [
      {
        "name": "",
        "type": "string"
      }
    ],
    "payable": false,
    "type": "function"
  }
]

// networkId -> registry address
const REGISTRY_MAP = {
  1: '0x44691B39d1a75dC4E0A0346CBB15E310e6ED1E86'
}

export default class MethodRegistry {
  constructor (opts = {}) {
    this.eth = opts.eth || new Eth(DEFAULT_ETH_NODE)
    this.network = opts.network || '1'
  }

  // !!! This function can mutate `this.eth`
  async initRegistry () {
    if (await this.eth.net.getId() !== '1') {
      this.eth = new Eth(DEFAULT_ETH_NODE)
    }

    const address = REGISTRY_MAP[this.network]

    if (!address) {
      throw new Error('No method registry found on the requested network.')
    }

    this.registry = new this.eth.Contract(REGISTRY_LOOKUP_ABI, address)
  }

  async lookup (sigBytes) {
    if (!this.registry) {
      await this.initRegistry()
    }

    return this.registry.methods.entries(sigBytes).call()
  }

  parse (signature) {
    // TODO: Throw if there are unknown types in the signature or there if is any chars after the closing parenthesis
    let name = signature.match(/^.+(?=\()/)[0]
    name = name.charAt(0).toUpperCase() + name.slice(1)
      .split(/(?=[A-Z])/).join(' ')

    const args = signature.match(/\(.+\)/)[0].slice(1, -1).split(',')

    return {
      name,
      args: args.map((arg) => { return { type: arg } })
    }
  }
}
