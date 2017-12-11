module.exports = {
  isType (identifier) {
    const n = identifier.substr(5)

    // `byte` is bytes1
    if (!n && identifier === 'byte') {
      identifier = 'bytes1'
      n = 1
    }

    return identifier.startsWith('bytes') &&
      n <= 32
  }
}
