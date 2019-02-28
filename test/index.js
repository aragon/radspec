import test from 'ava';
import { evaluate } from '../src';

test.only('radspec#evaluate', async t => {
  const expression = 'Will multiply `a` by 7 and return `a * 7`.';
  const call = {
    abi: [
      {
        name: 'multiply',
        constant: false,
        type: 'function',
        inputs: [
          {
            name: 'a',
            type: 'uint256',
          },
        ],
        outputs: [
          {
            name: 'd',
            type: 'uint256',
          },
        ],
      },
    ],
    transaction: {
      to: '0x8521742d3f456BD237E312d6E30724960f72517A',
      data:
        '0xc6888fa1000000000000000000000000000000000000000000000000000000000000007a',
    },
  };

  t.is(
      await evaluate(expression, call),
      'Will multiply 122 by 7 and return 854.'
  );
});
