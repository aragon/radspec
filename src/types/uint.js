export default {
  isType(identifier) {
    let n = identifier.substr(4);

    // Default to uint256
    if (!n) n = 256;

    return identifier.startsWith('uint') && n % 8 === 0 && n <= 256;
  },
};
