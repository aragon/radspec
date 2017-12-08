# radspec

Radspec is a safe alternative to Ethereum's natspec[[?](#aside-why-is-natspec-unsafe)].

## Quick Start

```js
const radspec = require('radspec')

const expression = 'Will multiply `a` by 7 and return `a * 7`.'
const call = {
  abi: [{
    name: 'multiply',
    constant: false,
    type: 'function',
    inputs: [{
      name: 'a',
      type: 'uint256'
    }],
    outputs: [{
      name: 'd',
      type: 'uint256'
    }]
  }],
  transaction: {
    to: '0x8521742d3f456bd237e312d6e30724960f72517a',
    data: '0xc6888fa1000000000000000000000000000000000000000000000000000000000000007a'
  }
}

console.log(
  radspec.evaluate(expression, call)
) // => "Will multiply 122 by 7 and return 854.""
```

## Installation

Simply use your favorite Node.js package manager:

```sh
npm i radspec
```

## Documentation

TBD.

## Contributing

TBD.

## Aside: Why is natspec unsafe?

Natspec accepts any valid JavaScript. There are multiple reasons this is a bad idea:

1. You either need to write your own JavaScript VM or use `eval` (unsafe!) from inside JavaScript
2. A fully-featured language with classes, functions and much more is absolutely overkill for something that could be solved with a simple DSL.

As dapps become increasingly complex, it is paramount that tools are written in a way that makes phishing near impossible. Evaluating JavaScript directly makes opens your dapp up to cross-site scripting attacks by users merely submitting a transaction(!).

## License

MIT
