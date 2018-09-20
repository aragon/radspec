module.exports = async (node, repeat = 1) => {
  return { type: 'string', value: node.value.repeat(repeat) }
}