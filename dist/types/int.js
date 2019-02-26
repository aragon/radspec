"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = {
  isType(identifier) {
    let n = identifier.substr(3); // Default to int256

    if (!n) n = 256;
    return identifier.startsWith('int') && n % 8 === 0 && n <= 256;
  }

};
exports.default = _default;
//# sourceMappingURL=int.js.map