import test from 'ava';
import BN from 'bn.js';
import { evaluateRaw } from '../../src/lib';
import { defaultHelpers } from '../../src/helpers';
import { tenPow } from '../../src/helpers/lib/formatBN';

const int = value => ({
  type: 'int256',
  value,
});

const address = (value = '0x0000000000000000000000000000000000000001') => ({
  type: 'address',
  value,
});

const bool = value => ({
  type: 'bool',
  value,
});

const string = value => ({
  type: 'string',
  value,
});

const bytes32 = value => ({
  type: 'bytes32',
  value,
});

const bytes = value => ({
  type: 'bytes',
  value,
});

const comparisonCases = [
  [
    {
      source: '`a > 2`',
      bindings: { a: int(3) },
    },
    'true',
  ],
  [
    {
      source: '`a > b`',
      bindings: { a: int(2), b: int(3) },
    },
    'false',
  ],
  [
    {
      source: '`a >= b`',
      bindings: { a: int(3), b: int(2) },
    },
    'true',
  ],
  [
    {
      source: '`a >= b`',
      bindings: { a: int(1), b: int(2) },
    },
    'false',
  ],
  [
    {
      source: '`a >= b`',
      bindings: { a: int(2), b: int(2) },
    },
    'true',
  ],
  [
    {
      source: '`a < b`',
      bindings: { a: int(3), b: int(2) },
    },
    'false',
  ],
  [
    {
      source: '`a < b`',
      bindings: { a: int(2), b: int(3) },
    },
    'true',
  ],
  [
    {
      source: '`a <= b`',
      bindings: { a: int(3), b: int(2) },
    },
    'false',
  ],
  [
    {
      source: '`a <= b`',
      bindings: { a: int(1), b: int(2) },
    },
    'true',
  ],
  [
    {
      source: '`a <= b`',
      bindings: { a: int(3), b: int(3) },
    },
    'true',
  ],
  [
    {
      source: '`a == b`',
      bindings: { a: int(3), b: int(3) },
    },
    'true',
  ],
  [
    {
      source: '`a != b`',
      bindings: { a: int(3), b: int(3) },
    },
    'false',
  ],
  [
    {
      source: '`a > 0x01`',
      bindings: { a: address('0x0000000000000000000000000000000000000002') },
    },
    'true',
  ],
  [
    {
      source: '`a == 0x0`',
      bindings: { a: address('0x0000000000000000000000000000000000000000') },
    },
    'true',
  ],
  [
    {
      source: '`a != 0x01`',
      bindings: { a: address('0x0000000000000000000000000000000000000002') },
    },
    'true',
  ],
  [
    {
      source: '`a != 0x01`',
      bindings: { a: address('0x0000000000000000000000000000000000000002') },
    },
    'true',
  ],
  [
    {
      source: '`a > 0x01`',
      bindings: {
        a: bytes32(
            '0x0000000000000000000000000000000000000000000000000000000000000002'
        ),
      },
    },
    'true',
  ],
];

const helperCases = [
  [
    {
      source: 'helper `@echo(@echo(\'hi \'), 1 + 100000 ^ 0)`',
      bindings: {},
    },
    'helper hi hi ',
  ],
  [
    {
      source: 'Ethereum launched `@formatDate(date)`',
      bindings: { date: int('1438269793') },
    },
    'Ethereum launched Jul. 30th 2015',
  ],
  [
    {
      source:
        'Ethereum launched on a `@formatDate(date, \'EEEE\')` in `@formatDate(date, \'MMMM yyyy\')`',
      bindings: { date: int('1438269793') },
    },
    'Ethereum launched on a Thursday in July 2015',
  ],
  [
    {
      source: 'Period duration is `@transformTime(time, \'day\')`',
      bindings: { time: int(3600 * 24 * 2 + 50) },
    },
    'Period duration is 2 days',
  ],
  [
    {
      source: 'Period duration is `@transformTime(time, \'best\')`',
      bindings: { time: int(3600 * 24 * 30) },
    },
    'Period duration is 1 month',
  ],
  [
    {
      source: '3600 seconds is `@transformTime(3600)`',
      bindings: {},
    },
    '3600 seconds is 1 hour',
  ],
  [
    {
      source: '10k minutes is `@transformTime(10 ^ 4, \'second\', \'minute\')`',
      bindings: {},
    },
    '10k minutes is 600000 seconds',
  ],
  [
    {
      source:
        'Hello `@fromHex(firstName)` `@fromHex(lastName, "utf8")`, `@fromHex(n, "number")` `@fromHex("0x69", "ascii")`s the definitive response.',
      bindings: {
        firstName: bytes32('0x446f75676c6173'),
        lastName: bytes32('0x4164616d73'),
        n: bytes('0x2a'),
      },
    },
    'Hello Douglas Adams, 42 is the definitive response.',
  ],
  [
    {
      source: 'Change required support to `@formatPct(support)`%',
      bindings: { support: int(new BN(50).mul(tenPow(16))) }, // 50 * 10^16
    },
    'Change required support to 50%',
  ],
  [
    {
      source: 'Change required support to `@formatPct(support, 10 ^ 18, 1)`%',
      bindings: {
        support: int(
            new BN(40).mul(tenPow(16)).add(new BN(43).mul(tenPow(14)))
        ),
      }, // 40 * 10^16 + 43 * 10^14
    },
    'Change required support to 40.4%',
  ],
  [
    {
      source: 'The genesis block is #`@getBlock(n)`',
      bindings: { n: int(0) },
      options: {
        userHelpers: {
          getBlock: provider => async n => {
            return {
              type: 'string',
              value: (await provider.getBlock(n.toNumber())).number,
            };
          },
        },
      },
    },
    'The genesis block is #0',
  ],
  [
    {
      source: 'Bar `@bar(shift)` foo `@foo(n)`',
      bindings: { shift: bool(true), n: int(7) },
      options: {
        userHelpers: {
          bar: () => shift => ({
            type: 'string',
            value: shift ? 'BAR' : 'bar',
          }),
          foo: () => n => ({ type: 'number', value: n * 7 }),
        },
      },
    },
    'Bar BAR foo 49',
  ],
];

const dataDecodeCases = [
  [
    {
      source: 'Perform action: `@radspec(addr, data)`',
      bindings: {
        addr: address(),
        data: bytes(
            '0x13af40350000000000000000000000000000000000000000000000000000000000000002'
        ), // setOwner(address), on knownFunctions
      },
    },
    'Perform action: Set 0x0000000000000000000000000000000000000002 as the new owner',
  ],
  [
    {
      source: 'Payroll: `@radspec(addr, data)`!',
      bindings: {
        addr: address(),
        data: bytes('0x6881385b'), // payday(), on knownFunctions
      },
    },
    'Payroll: Get owed Payroll allowance!',
  ],
  [
    {
      source: 'Transfer: `@radspec(addr, data)`',
      bindings: {
        addr: address('0x960b236a07cf122663c4303350609a66a7b288c0'),
        data: bytes(
            '0xa9059cbb00000000000000000000000031ab1f92344e3277ce9404e4e097dab7514e6d2700000000000000000000000000000000000000000000000821ab0d4414980000'
        ), // transfer(), on knownFunctions requiring helpers
      },
    },
    'Transfer: Transfer 150 ANT to 0x31AB1f92344e3277ce9404E4e097dab7514E6D27',
  ],
  [
    {
      source: 'Cast a `@radspec(addr, data)`',
      bindings: {
        addr: address(),
        data: bytes('0xdf133bca'), // vote(uint256,bool,bool), from on-chain registry
      },
    },
    'Cast a Vote',
  ],
  [
    {
      source: 'Perform action: `@radspec(addr, data)`',
      bindings: {
        addr: address(),
        data: bytes('0x12345678'), // random signature
      },
    },
    'Perform action: Unknown function (0x12345678)',
  ],
  [
    {
      source: 'Perform action: `@radspec(addr, data)`',
      bindings: {
        addr: address(),
        data: bytes('0x12'), // bad signature
      },
    },
    'Perform action: Unknown function (0x12)',
  ],
];

const cases = [
  // Bindings
  [
    {
      source: 'a is `a`, b is `b` and "c d" is `c d`',
      bindings: { a: int(1), b: int(2), c: int(3), d: int(4) },
    },
    'a is 1, b is 2 and "c d" is 3 4',
  ],
  [
    {
      source: 'An empty string`\'\'`',
      bindings: {},
    },
    'An empty string',
  ],

  // Maths
  [
    {
      source: 'Will multiply `a` by 7 and return `a * 7`',
      bindings: { a: int(122) },
    },
    'Will multiply 122 by 7 and return 854',
  ],
  [
    {
      source: 'First case is `2 * 2 + 6`, second case is `2 * (2 + 6)`',
    },
    'First case is 10, second case is 16',
  ],
  [
    {
      source: 'First case is `2^5`, second case is `2^2 + 1`',
    },
    'First case is 32, second case is 5',
  ],
  [
    {
      source:
        'First case is `(11 - 1) * 2^5`, second case is `3 * 2 ^ (4 - 1) + 1`',
    },
    'First case is 320, second case is 25',
  ],
  [
    {
      source:
        'First case is `(11 - 1) / 2`, second case is `3 * 2 ^ (4 - 1) / 3`',
    },
    'First case is 5, second case is 8',
  ],
  [
    {
      source: 'First case is `(11 - 1) % 3`, second case is `3 * 2 % 5`',
    },
    'First case is 1, second case is 1',
  ],
  [
    {
      source:
        'Basic arithmetic: `a` + `b` is `a + b`, - `c` that\'s `a + b - c`, quick mafs',
      bindings: { a: int(2), b: int(2), c: int(1) },
    },
    'Basic arithmetic: 2 + 2 is 4, - 1 that\'s 3, quick mafs',
  ],
  [
    {
      source: 'This will default to `b`: `a || b`',
      bindings: { a: int(0), b: int(1) },
    },
    'This will default to 1: 1',
  ],
  [
    {
      source: 'This will default to `a`: `a || b`',
      bindings: { a: int(1), b: int(0) },
    },
    'This will default to 1: 1',
  ],
  [
    {
      source: 'This will default to `b`: `a || b`',
      bindings: {
        a: bytes32(
            '0x0000000000000000000000000000000000000000000000000000000000000000'
        ),
        b: int(1),
      },
    },
    'This will default to 1: 1',
  ],

  [
    {
      source: 'True is not `false ? true : false`',
      bindings: {},
    },
    'True is not false',
  ],

  // External calls
  [
    {
      source: 'Allocate `amount token.symbol(): string`.',
      bindings: {
        amount: int(100),
        token: address('0x960b236A07cf122663c4303350609A66A7B288C0'),
      },
    },
    'Allocate 100 ANT.',
  ],
  [
    {
      source: 'Allocate `amount token.symbol(): string` (non-checksummed).',
      bindings: {
        amount: int(100),
        token: address('0x960b236a07cf122663c4303350609a66a7b288c0'),
      },
    },
    'Allocate 100 ANT (non-checksummed).',
  ],
  [
    {
      source:
        'Burns the `token.symbol(): string` balance of `person` (balance is `token.balanceOf(person): uint256 / 1000000000000000000`)',
      bindings: {
        token: address('0x960b236A07cf122663c4303350609A66A7B288C0'),
        person: address('0x0000000000000000000000000000000000000001'),
      },
    },
    'Burns the ANT balance of 0x0000000000000000000000000000000000000001 (balance is 0)',
  ],
  [
    {
      source:
        'Burns the `self.symbol(): string` balance of `person` (balance is `self.balanceOf(person): uint256 / 1000000000000000000`)',
      bindings: {
        person: address('0x0000000000000000000000000000000000000001'),
      },
      options: { to: '0x960b236A07cf122663c4303350609A66A7B288C0' },
    },
    'Burns the ANT balance of 0x0000000000000000000000000000000000000001 (balance is 0)',
  ],
  [
    {
      source:
        'Send ETH to the sale at block `((self.controller(): address).sale(): address).initialBlock(): uint` from `person`',
      bindings: {
        person: address('0x0000000000000000000000000000000000000001'),
      },
      options: { to: '0x960b236A07cf122663c4303350609A66A7B288C0' },
    },
    'Send ETH to the sale at block 3723000 from 0x0000000000000000000000000000000000000001',
  ],
  [
    {
      source:
        'Initialize Finance app for Vault at `_vault` with period length of `(_periodDuration - _periodDuration % 86400) / 86400` day`_periodDuration >= 172800 ? \'s\' : \' \'`',
      bindings: {
        _periodDuration: int(86400 * 2),
        _vault: address('0x960b236A07cf122663c4303350609A66A7B288C0'),
      },
    },
    'Initialize Finance app for Vault at 0x960b236A07cf122663c4303350609A66A7B288C0 with period length of 2 days',
  ],
  [
    {
      source: 'Vote `_supports ? \'yay\' : \'nay\'`',
      bindings: { _supports: bool(false) },
    },
    'Vote nay',
  ],
  [
    {
      source: 'Token `_amount / 10^18`',
      bindings: { _amount: int(new BN(10).mul(new BN(10).pow(new BN(18)))) },
    },
    'Token 10',
  ],
  [
    {
      source: '`_bool ? \'h\' + _var + \'o\' : \'damn\'`',
      bindings: { _bool: bool(true), _var: string('ell') },
    },
    'hello',
  ],

  ...comparisonCases,
  ...helperCases,
  ...dataDecodeCases,
];

cases.forEach(([input, expected], index) => {
  test(`${index} - ${input.source}`, async t => {
    const { userHelpers } = input.options || {};
    const actual = await evaluateRaw(input.source, input.bindings, {
      ...input.options,
      availableHelpers: { ...defaultHelpers, ...userHelpers },
    });
    t.is(
        actual,
        expected,
        `Expected "${
          input.source
        }" to evaluate to "${expected}", but evaluated to "${actual}"`
    );
  });
});
