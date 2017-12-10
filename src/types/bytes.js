module.exports = {
  isType (identifier) {
    const n = identifier.substr(5)

    return identifier.startsWith('bytes') &&
      n <= 32
  }
}
