import BN from 'bn.js';
import { formatBN, tenPow } from './lib/formatBN';

export default () =>
  /**
   * Format a percentage amount
   *
   * @param {*} value The number to be formatted as a percentage
   * @param {*} [base=10^18] The number that is considered to be 100% when calculating the percentage
   * @param {*} [precision=2] The number of decimal places to format to
   * @return {Promise<radspec/evaluator/TypedValue>}
   */
  async (value, base = tenPow(18), precision = 2) => {
    const valueBn = new BN(value);
    const baseBn = new BN(base);

    const oneHundred = tenPow(2);
    const formattedAmount = formatBN(
        valueBn.mul(oneHundred),
        baseBn,
        Number(precision)
    );

    return {
      type: 'string',
      value: `${formattedAmount}`,
    };
  };
