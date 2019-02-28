import test from 'ava';
import { scan } from '../../src/scanner';

test('Scanner: types', async t => {
  const cases = [
    ['`a`', ['TICK', { type: 'IDENTIFIER', value: 'a' }, 'TICK']],
    ['`b`', ['TICK', { type: 'IDENTIFIER', value: 'b' }, 'TICK']],
    ['`test0123`', ['TICK', { type: 'IDENTIFIER', value: 'test0123' }, 'TICK']],
    ['`_hidden`', ['TICK', { type: 'IDENTIFIER', value: '_hidden' }, 'TICK']],
    ['`$var0`', ['TICK', { type: 'IDENTIFIER', value: '$var0' }, 'TICK']],
  ];
  t.plan(cases.length);

  for (const [input, expected] of cases) {
    const actual = await scan(input);
    t.deepEqual(
        actual.map(token => {
        // Strip out details from non-type tokens
          if (token.type !== 'IDENTIFIER') {
            return token.type;
          }
          return token;
        }),
        expected,
        `Expected "${input}" to give a "${expected[1]}" token, got a "${
          actual[1].type
        }" token`
    );
  }
});
