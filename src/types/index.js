import bool from './bool'
import int from './int'
import uint from './uint'
import address from './address'
import bytes from './bytes'
import string from './string'
import fixed from './fixed'
import ufixed from './ufixed'

export default {
  types: {
    bool,
    int,
    uint,
    address,
    bytes,
    string,
    fixed,
    ufixed
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
    return this.types.int.isType(identifier) ||
      this.types.uint.isType(identifier)
  },

  isAddress (identifier) {
    return this.types.address.isType(identifier) || (
      this.types.bytes.isType(identifier) &&
      this.types.bytes.size(identifier) <= 20
    )
  }
}
