"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = {
  isType(identifier) {
    let n = identifier.substr(4); // Default to uint256

    if (!n) n = 256;
    return identifier.startsWith('uint') && n % 8 === 0 && n <= 256;
  }

};
exports.default = _default;
//# sourceMappingURL=uint.js.map