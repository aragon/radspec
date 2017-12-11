module.exports = {
  isType (identifier) {
    let n = identifier.substr(5)

    // `byte` is bytes1
    if (!n && identifier === 'byte') {
      identifier = 'bytes1'
      n = 1
    }

    return identifier.startsWith('bytes') &&
      n <= 32
  }
}
