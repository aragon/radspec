# radspec 🤘

[![Travis branch](https://img.shields.io/travis/aragon/radspec/master.svg?style=flat-square)](https://travis-ci.org/aragon/radspec)
[![Coveralls github branch](https://img.shields.io/coveralls/github/aragon/radspec/master.svg?style=flat-square)](https://coveralls.io/github/aragon/radspec)

Radspec is a safe alternative to Ethereum's NatSpec[[?](#aside-why-is-natspec-unsafe)].

## Features

- **External calls**: Radspec can perform calls to external contracts
- **Safe**: Radspec has no DOM access at all.
- **Simple**: Even though radspec requires you to inline types for external calls, the syntax is very familiar and readable (it looks like Flow).
- **Compatible**: Most NatSpec comments that already exist are also compatible ith Radspec.

## Quick Start

```js
import radspec from 'radspec'

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

radspec.evaluate(expression, call)
  .then(console.log) // => "Will multiply 122 by 7 and return 854."
```

See more examples [here](examples).

## Installation

Simply use your favorite Node.js package manager:

```sh
npm i radspec
```

## Documentation

Documentation about radspec and the internals of radspec can be found [here](docs).

## Contributing

TBD.

## Aside: Why is NatSpec unsafe?

NatSpec accepts any valid JavaScript. There are multiple reasons this is a bad idea:

1. You either need to write your own JavaScript VM or use `eval` (unsafe!) from inside JavaScript
2. A fully-featured language with classes, functions and much more is absolutely overkill for something that could be solved with a simple DSL.

As dapps become increasingly complex, it is paramount that tools are written in a way that makes phishing near impossible. Evaluating JavaScript directly makes opens your dapp up to cross-site scripting attacks by users merely submitting a transaction(!).

## License

MIT
