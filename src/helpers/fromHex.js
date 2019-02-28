import { ethers } from 'ethers';

const isHexStrict = hex => {
  return (
    (typeof hex === 'number' || typeof hex === 'string') &&
    /^(-)?0x[0-9a-f]*$/i.test(hex)
  );
};

const hexToAscii = hex => {
  if (!isHexStrict(hex)) {
    throw new Error('The parameter must be a valid HEX string.');
  }

  let str = '';

  let i = 0;
  const l = hex.length;

  if (hex.substring(0, 2) === '0x') {
    i = 2;
  }
  for (; i < l; i += 2) {
    const code = parseInt(hex.substr(i, 2), 16);
    str += String.fromCharCode(code);
  }

  return str;
};

export default () =>
  /**
   * Returns the string representation of a given hex value
   *
   * @param {string} hex The hex string
   * @param {string} [to='utf8'] The type to convert the hex from (supported types: 'utf8', 'number', 'decimal')
   * @return {radspec/evaluator/TypedValue}
   */
  (hex, to = 'utf8') => {
    if (to === 'utf8') {
      return {
        type: 'string',
        value: ethers.utils.toUtf8String(hex),
      };
    }

    if (to === 'number' || to === 'decimal') {
      return {
        type: 'string',
        value: ethers.utils.bigNumberify(hex).toString(),
      };
    }

    if (to === 'ascii') {
      return {
        type: 'string',
        value: hexToAscii(hex),
      };
    }

    return {
      type: 'string',
      value: hex,
    };
  };

ethers.utils.to;
