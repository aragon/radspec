const MILLISECONDS_IN_A_SECOND = 1000

export const blockTime = (eth) =>
  async (blockNumber, showBlock = true, averageBlockTime = 13.965) => {
    let timestamp
    const currentBlock = await eth.getBlockNumber()

    if (currentBlock >= blockNumber) {
      timestamp = (await eth.getBlock(blockNumber)).timestamp * MILLISECONDS_IN_A_SECOND
    } else {
      const { timestamp: currentTimestamp } = await eth.getBlock(currentBlock)
      const blockDuration = (blockNumber - currentBlock) * averageBlockTime
      timestamp = (currentTimestamp + blockDuration) * MILLISECONDS_IN_A_SECOND
    }

    return {
      type: 'string',
      value: `${new Date(timestamp).toDateString()}${showBlock ? ` (block number: ${blockNumber})` : ''}`
    }
  }

export const isBlockMined = (eth) =>
  async (blockNumber) => {
    const currentBlock = await eth.getBlockNumber()
    return {
      type: 'bool',
      value: currentBlock >= blockNumber
    }
  }
