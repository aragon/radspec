"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _bool = _interopRequireDefault(require("./bool"));

var _int = _interopRequireDefault(require("./int"));

var _uint = _interopRequireDefault(require("./uint"));

var _address = _interopRequireDefault(require("./address"));

var _bytes = _interopRequireDefault(require("./bytes"));

var _string = _interopRequireDefault(require("./string"));

var _fixed = _interopRequireDefault(require("./fixed"));

var _ufixed = _interopRequireDefault(require("./ufixed"));

var _default = {
  types: {
    bool: _bool.default,
    int: _int.default,
    uint: _uint.default,
    address: _address.default,
    bytes: _bytes.default,
    string: _string.default,
    fixed: _fixed.default,
    ufixed: _ufixed.default
  },

  isType(identifier) {
    const typeNames = Object.keys(this.types);

    for (let typeName of typeNames) {
      if (this.types[typeName].isType(identifier)) {
        return true;
      }
    }

    return false;
  },

  isInteger(identifier) {
    return this.types.int.isType(identifier) || this.types.uint.isType(identifier);
  },

  isAddress(identifier) {
    return this.types.address.isType(identifier) || this.types.bytes.isType(identifier) && this.types.bytes.size(identifier) <= 20;
  }

};
exports.default = _default;
//# sourceMappingURL=index.js.map