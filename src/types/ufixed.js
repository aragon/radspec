export default {
  isType(identifier) {
    let mXn = identifier.substr(6);

    if (!mXn) mXn = '128x18';
    if (mXn.indexOf('x') === -1) return false;

    const m = mXn.substr(0, mXn.indexOf('x'));
    const n = mXn.substr(mXn.indexOf('x') + 1, mXn.length);

    if (n === '' || m === '') return false;

    return (
      identifier.startsWith('ufixed') &&
      m % 8 === 0 &&
      m <= 256 &&
      m >= 8 &&
      n <= 80 &&
      n >= 0
    );
  },
};
