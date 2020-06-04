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
    this.network = opts.network || '1'
  }

  // !!! This function can mutate `this.provider`
  async initRegistry () {
    const network = await this.provider.getNetwork()
    if (network.chainId !== 1) {
      this.provider = new ethers.providers.WebSocketProvider(DEFAULT_ETH_NODE)
    }

    const address = REGISTRY_MAP[this.network]

    if (!address) {
      throw new Error('No method registry found on the requested network.')
    }

    this.registry = new ethers.Contract(
      address,
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

  parse (signature) {
    const fragment = ethers.utils.FunctionFragment.from(signature)

    return {
      name:
        fragment.name.charAt(0).toUpperCase() +
        fragment.name
          .slice(1)
          .split(/(?=[A-Z])/)
          .join(' '),
      args: fragment.inputs.map((input) => {
        return { type: input.type }
      })
    }
  }
}
