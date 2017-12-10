const bool = require('./bool')
const int = require('./int')
const uint = require('./uint')
const address = require('./address')
const bytes = require('./bytes')
const string = require('./string')

module.exports = {
  types: {
    bool,
    int,
    uint,
    address,
    bytes,
    string
  },

  isType (identifier) {
    const typeNames = Object.keys(this.types)

    for (let typeName of typeNames) {
      if (this.types[typeName].isType(identifier)) {
        return true
      }
    }

    return false
  },

  isInteger (identifier) {
    return this.types.int.isType(identifier)
      || this.types.uint.isType(identifier)
  }
}