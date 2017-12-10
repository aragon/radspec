module.exports = {
  isType (identifier) {
    const n = identifier.substr(4)

    return identifier.startsWith('uint') &&
      (n % 8 === 0) &&
      n <= 256
  }
}
