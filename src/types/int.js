module.exports = {
  isType (identifier) {
    const n = identifier.substr(3)

    return identifier.startsWith('int') &&
      (n % 8 === 0) &&
      n <= 256
  }
}
