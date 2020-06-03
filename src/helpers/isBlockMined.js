export default (eth) =>
  async (blockNumber) => {
    const { number: currentBlock } = await eth.getBlock('latest')
    return {
      type: 'bool',
      value: currentBlock >= blockNumber
    }
  }
