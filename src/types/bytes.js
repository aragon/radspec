export default {
  isType(identifier) {
    if (identifier === 'bytes') {
      return true;
    }

    let n = identifier.substr(5);

    // `byte` is bytes1
    if (!n && identifier === 'byte') {
      identifier = 'bytes1';
      n = 1;
    }

    return identifier.startsWith('bytes') && n <= 32;
  },

  size(identifier) {
    if (identifier === 'bytes') {
      return Infinity;
    }

    // `byte` is bytes1
    if (identifier === 'byte') {
      identifier = 'bytes1';
    }

    return identifier.substr(5);
  },
};
