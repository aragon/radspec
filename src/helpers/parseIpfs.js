import axios from 'axios'
import Web3Utils from 'web3-utils'

// default endpoints to be queried
const ipfsEndpoints = ['https://ipfs.autark.xyz:5001/api/v0']

export default () =>
  async (cid, node = '', ...keys) => {
    node && ipfsEndpoints.push(node)
    let rejectedPromises = 0
    const results = await Promise.all(
      ipfsEndpoints.map(async ipfsEndpoint => {
        const ipfsQuery = `${ipfsEndpoint}/cat?arg=${cid}`
        try {
          const { data } = await axios.get(ipfsQuery)
          return getValue(data, keys, ipfsQuery)
        } catch (err) {
          return ++rejectedPromises < ipfsEndpoints.length
            ? null : {
              type: 'string',
              value: `failed getting data from IPFS: ${err}`
            }
        }
      })
    )
    return results.reduce((finalResult, candidate) => candidate || finalResult)
  }

const getValue = (data, keys = [], ipfsQuery) => {
  const key = keys.shift()
  if (!key) {
    switch (typeof data) {
      case 'string':
        return Web3Utils.isAddress(data)
          ? {
            type: 'address',
            value: Web3Utils.toChecksumAddress(data)
          }
          : {
            type: 'string',
            value: data
          }
      default:
        return {
          type: 'string',
          value: ipfsQuery
        }
    }
  }

  return data[key] ? getValue(data[key], keys, ipfsQuery) : { value: `failed to find value for key: ${key}`, type: 'string' }
}
