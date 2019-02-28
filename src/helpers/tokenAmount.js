import BN from 'bn.js';
import { ethers } from 'ethers';
import {
  ERC20_SYMBOL_BYTES32_ABI,
  ERC20_SYMBOL_DECIMALS_ABI,
  ETH,
} from './lib/token';
import { formatBN, tenPow } from './lib/formatBN';

export default provider =>
  /**
   * Format token amounts taking decimals into account
   *
   * @param {string} tokenAddress The address of the token
   * @param {*} amount The absolute amount for the token quantity (wei)
   * @param {bool} showSymbol Whether the token symbol will be printed after the amount
   * @param {*} [precision=2] The number of decimal places to format to
   * @return {Promise<radspec/evaluator/TypedValue>}
   */
  async (tokenAddress, amount, showSymbol = true, precision = 2) => {
    const amountBn = new BN(amount);

    let decimals;
    let symbol;

    if (tokenAddress === ETH) {
      decimals = new BN(18);
      if (showSymbol) {
        symbol = 'ETH';
      }
    } else {
      let token = new ethers.Contract(
          tokenAddress,
          ERC20_SYMBOL_DECIMALS_ABI,
          provider
      );

      decimals = new BN(await token.methods.decimals().call());
      if (showSymbol) {
        try {
          symbol = (await token.methods.symbol().call()) || '';
        } catch (err) {
          // Some tokens (e.g. DS-Token) use bytes32 for their symbol()
          token = new ethers.Contract(
              tokenAddress,
              ERC20_SYMBOL_BYTES32_ABI,
              provider
          );

          symbol = (await token.methods.symbol().call()) || '';
          symbol = symbol && ethers.utils.toUtf8String(symbol);
        }
      }
    }

    const formattedAmount = formatBN(
        amountBn,
        tenPow(decimals),
        Number(precision)
    );

    return {
      type: 'string',
      value: showSymbol ? `${formattedAmount} ${symbol}` : formattedAmount,
    };
  };
