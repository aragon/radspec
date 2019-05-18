# radspec 🤘

[![Travis branch](https://img.shields.io/travis/aragon/radspec/master.svg?style=flat-square)](https://travis-ci.org/aragon/radspec)
[![Coveralls github branch](https://img.shields.io/coveralls/github/aragon/radspec/master.svg?style=flat-square)](https://coveralls.io/github/aragon/radspec)

Radspec is a language specification and interpreter for dynamic expressions in Ethereum's NatSpec.

This allows smart contact developers to show improved function documentation to end users.

![Screen Shot 2019-04-04 at 10 44 19 AM](https://user-images.githubusercontent.com/382183/55565167-5cfbd780-56c7-11e9-8ca8-24c727e54ab5.png)

## Features

- **Expressive**: Show relevant details to Smart contract end-users at the time they make transactions.
- **External calls**: Radspec can query other contracts.
- **Safe**: Radspec has no access to DOM.
- **Compatible**: Most existing NatSpec dynamic expressions are compatible with Radspec.

## Introduction & quick start

Radspec supports any contract programming language, such as Solidity or Vyper because radspec works on the compiled JSON ABI. Here is an example using Solidity.

```solidity
pragma solidity ^0.5.0;

contract Tree {
    /// @notice Set the tree age to `numYears` years
    function setAge(uint256 numYears) external {
        // set the age into storage
    }
}
```

Notice the *dynamic expression* documentation for the `setAge` function. When presented to the end user, this will render based on the inputs provided by the user. For example, if the end user is calling the contract with an input of 10 years, this is specified to render as:

> Set the tree age to 10 years

Use the Solidity compiler to generate user documentation and ABI with:

```sh
solc --userdoc --abi tree.sol
```

This produces the outputs:

```json
{
  "methods" : 
  {
    "setAge(uint256)" : 
    {
      "notice" : "Set the tree age to `numYears` years"
    }
  }
}

```

and

```json
[{
  "constant":false,
  "inputs":[{"name":"numYears","type":"uint256"}],
  "name":"setAge",
  "outputs":[],
  "payable":false,
  "stateMutability":"nonpayable",
  "type":"function"
}]
```

Write a simple tool using radspec to interpret this.

```js
import radspec from 'radspec'

// Set userDoc and ABI from above
const expression = userDoc.methods["setAge(uint256)"].notice
const call = {
  abi: abi,
  transaction: {
    to: '0x8521742d3f456bd237e312d6e30724960f72517a',
    data: '0xc6888fa1000000000000000000000000000000000000000000000000000000000000007a'
  }
}
radspec.evaluate(expression, call)
  .then(console.log) // => "Set the tree age to 10 years"
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

TBD

## License

MIT
