// From: https://github.com/danfinlay/eth-method-registry
import { ethers } from 'ethers'

import { DEFAULT_ETH_NODE } from '../../defaults'

const REGISTRY_LOOKUP_ABI = [
  'function entries(bytes4) public view returns (string)'
]

// networkId -> registry address
const REGISTRY_MAP = {
  1: '0x44691B39d1a75dC4E0A0346CBB15E310e6ED1E86'
}

export default class MethodRegistry {
  constructor (opts = {}) {
    this.provider =
      opts.provider || new ethers.providers.WebSocketProvider(DEFAULT_ETH_NODE)
    this.registryAddres = opts.registry || REGISTRY_MAP[opts.network]
  }

  async initRegistry () {
    if (!this.registryAddres) {
      throw new Error('No method registry found for the network.')
    }

    this.registry = new ethers.Contract(
      this.registryAddres,
      REGISTRY_LOOKUP_ABI,
      this.provider
    )
  }

  async lookup (sigBytes) {
    if (!this.registry) {
      await this.initRegistry()
    }

    return this.registry.entries(sigBytes)
  }
}
