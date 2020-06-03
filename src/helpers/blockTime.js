import { format } from 'date-fns'
const MILLISECONDS_IN_A_SECOND = 1000

export default (eth) =>
  async (blockNumber, showBlock = true, averageBlockTime = 15, formatString = 'yyyy-MM-dd', dateFmtOptions = {}) => {
    const { number: currentBlock, timestamp: currentTimestamp } = await eth.getBlock('latest')
    const futureBlock = currentBlock < blockNumber
    let rawTimestamp

    if (!futureBlock) {
      rawTimestamp = (await eth.getBlock(blockNumber)).timestamp * MILLISECONDS_IN_A_SECOND
    } else {
      const blockDuration = (blockNumber - currentBlock) * averageBlockTime
      rawTimestamp = (currentTimestamp + blockDuration) * MILLISECONDS_IN_A_SECOND
    }

    const formattedTime = format(rawTimestamp, formatString, dateFmtOptions)

    return {
      type: 'string',
      value: `${formattedTime}${futureBlock ? ' (estimated)' : ''}${showBlock ? ` (block number: ${blockNumber})` : ''}`
    }
  }
