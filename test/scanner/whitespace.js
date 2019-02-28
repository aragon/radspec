import test from 'ava';
import { scan } from '../../src/scanner';

test('Scanner: Whitespace', async t => {
  const cases = [
    ['` `', ['TICK', 'TICK']],
    ['`\r`', ['TICK', 'TICK']],
    ['`\t`', ['TICK', 'TICK']],
    ['`\n`', ['TICK', 'TICK']],
    [' \r\t\n', ['MONOLOGUE']],
  ];
  t.plan(cases.length);

  for (const [input, expected] of cases) {
    const actual = await scan(input);
    t.deepEqual(
        actual.map(token => token.type),
        expected,
        `Expected whitespace to be ignored except in monologues`
    );
  }
});
