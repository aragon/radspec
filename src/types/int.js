module.exports = {
  isType (identifier) {
    let n = identifier.substr(3)

    // Default to int256
    if (!n) n = 256

    return identifier.startsWith('int') &&
      (n % 8 === 0) &&
      n <= 256
  }
}
