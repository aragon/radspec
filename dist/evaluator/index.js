"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.evaluate = evaluate;
exports.Evaluator = void 0;

var _web3EthAbi = _interopRequireDefault(require("web3-eth-abi"));

var _web3Eth = _interopRequireDefault(require("web3-eth"));

var _web3Utils = _interopRequireDefault(require("web3-utils"));

var _bn = _interopRequireDefault(require("bn.js"));

var _types = _interopRequireDefault(require("../types"));

var _HelperManager = _interopRequireDefault(require("../helpers/HelperManager"));

var _defaults = require("../defaults");

/**
 * @module radspec/evaluator
 */

/**
 * A value coupled with a type
 *
 * @class TypedValue
 * @param {string} type The type of the value
 * @param {*} value The value
 * @property {string} type
 * @property {*} value
 */
class TypedValue {
  constructor(type, value) {
    this.type = type;
    this.value = value;

    if (_types.default.isInteger(this.type) && !_bn.default.isBN(this.value)) {
      this.value = new _bn.default(this.value);
    }

    if (this.type === "address") {
      if (!_web3Utils.default.isAddress(this.value)) {
        throw new Error(`Invalid address "${this.value}"`);
      }

      this.value = _web3Utils.default.toChecksumAddress(this.value);
    }
  }
  /**
   * Get the string representation of the wrapped value
   *
   * @return {string}
   */


  toString() {
    return this.value.toString();
  }

}
/**
 * Walks an AST and evaluates each node.
 *
 * @class Evaluator
 * @param {radspec/parser/AST} ast The AST to evaluate
 * @param {radspec/Bindings} bindings An object of bindings and their values
 * @param {?Object} options An options object
 * @param {?Object} options.availablehelpers Available helpers
 * @param {?Web3} options.eth Web3 instance (used over options.ethNode)
 * @param {?string} options.ethNode The URL to an Ethereum node
 * @param {?string} options.to The destination address for this expression's transaction
 * @property {radspec/parser/AST} ast
 * @property {radspec/Bindings} bindings
 */


class Evaluator {
  constructor(ast, bindings, {
    availableHelpers = {},
    eth,
    ethNode,
    to,
    returnType = "string"
  } = {}) {
    this.ast = ast;
    this.bindings = bindings;
    this.eth = eth || new _web3Eth.default(ethNode || _defaults.DEFAULT_ETH_NODE);
    this.to = to && new TypedValue("address", to);
    this.helpers = new _HelperManager.default(availableHelpers);
    this.returnType = returnType;
  }
  /**
   * Evaluate an array of AST nodes.
   *
   * @param  {Array<radspec/parser/Node>} nodes
   * @return {Promise<Array<string>>}
   */


  async evaluateNodes(nodes) {
    return Promise.all(nodes.map(this.evaluateNode.bind(this)));
  }
  /**
   * Evaluate a single node.
   *
   * @param  {radspec/parser/Node} node
   * @return {Promise<string>}
   */


  async evaluateNode(node) {
    if (node.type === "ExpressionStatement") {
      return (await this.evaluateNodes(node.body)).join(" ");
    }

    if (node.type === "GroupedExpression") {
      return this.evaluateNode(node.body);
    }

    if (node.type === "MonologueStatement") {
      return new TypedValue("string", node.value);
    }

    if (node.type === "StringLiteral") {
      return new TypedValue("string", node.value || "");
    }

    if (node.type === "NumberLiteral") {
      return new TypedValue("int256", node.value);
    }

    if (node.type === "BytesLiteral") {
      const length = Math.ceil((node.value.length - 2) / 2);

      if (length > 32) {
        this.panic("Byte literal represents more than 32 bytes");
      }

      return new TypedValue(`bytes${length}`, node.value);
    }

    if (node.type === "BoolLiteral") {
      return new TypedValue("bool", node.value === "true");
    }

    if (node.type === "BinaryExpression") {
      const left = await this.evaluateNode(node.left);
      const right = await this.evaluateNode(node.right); // String concatenation

      if ((left.type === "string" || right.type === "string") && node.operator === "PLUS") {
        return new TypedValue("string", left.value.toString() + right.value.toString());
      } // TODO Additionally check that the type is signed if subtracting


      if (!_types.default.isInteger(left.type) || !_types.default.isInteger(right.type)) {
        this.panic(`Cannot evaluate binary expression "${node.operator}" for non-integer types "${left.type}" and "${right.type}"`);
      }

      switch (node.operator) {
        case "PLUS":
          return new TypedValue("int256", left.value.add(right.value));

        case "MINUS":
          return new TypedValue("int256", left.value.sub(right.value));

        case "STAR":
          return new TypedValue("int256", left.value.mul(right.value));

        case "POWER":
          return new TypedValue("int256", left.value.pow(right.value));

        case "SLASH":
          return new TypedValue("int256", left.value.div(right.value));

        case "MODULO":
          return new TypedValue("int256", left.value.mod(right.value));

        default:
          this.panic(`Undefined binary operator "${node.operator}"`);
      }
    }

    if (node.type === "ComparisonExpression") {
      const left = await this.evaluateNode(node.left);
      const right = await this.evaluateNode(node.right);
      let leftValue = left.value;
      let rightValue = right.value;

      const bothTypesAddress = (left, right) => // isAddress is true if type is address or bytes with size less than 20
      _types.default.isAddress(left.type) && _types.default.isAddress(right.type);

      const bothTypesBytes = (left, right) => _types.default.types.bytes.isType(left.type) && _types.default.types.bytes.isType(right.type); // Conversion to BN for comparison will happen if:
      // - Both types are addresses or bytes of any size (can be different sizes)
      // - If one of the types is an address and the other bytes with size less than 20


      if (bothTypesAddress(left, right) || bothTypesBytes(left, right)) {
        leftValue = _web3Utils.default.toBN(leftValue);
        rightValue = _web3Utils.default.toBN(rightValue);
      } else if (!_types.default.isInteger(left.type) || !_types.default.isInteger(right.type)) {
        this.panic(`Cannot evaluate binary expression "${node.operator}" for non-integer or fixed-size bytes types "${left.type}" and "${right.type}"`);
      }

      switch (node.operator) {
        case "GREATER":
          return new TypedValue("bool", leftValue.gt(rightValue));

        case "GREATER_EQUAL":
          return new TypedValue("bool", leftValue.gte(rightValue));

        case "LESS":
          return new TypedValue("bool", leftValue.lt(rightValue));

        case "LESS_EQUAL":
          return new TypedValue("bool", leftValue.lte(rightValue));

        case "EQUAL_EQUAL":
          return new TypedValue("bool", leftValue.eq(rightValue));

        case "BANG_EQUAL":
          return new TypedValue("bool", !leftValue.eq(rightValue));
      }
    }

    if (node.type === "TernaryExpression") {
      if ((await this.evaluateNode(node.predicate)).value) {
        return this.evaluateNode(node.left);
      }

      return this.evaluateNode(node.right);
    }

    if (node.type === "DefaultExpression") {
      const left = await this.evaluateNode(node.left);
      let leftFalsey;

      if (_types.default.isInteger(left.type)) {
        leftFalsey = left.value.isZero();
      } else if (left.type === "address" || left.type.startsWith("bytes")) {
        leftFalsey = /^0x[0]*$/.test(left.value);
      } else {
        leftFalsey = !left.value;
      }

      return leftFalsey ? this.evaluateNode(node.right) : left;
    }

    if (node.type === "CallExpression") {
      // TODO Add a check for number of return values (can only be 1 for now)
      let target; // Inject self

      if (node.target.type === "Identifier" && node.target.value === "self") {
        target = this.to;
      } else {
        target = await this.evaluateNode(node.target);
      }

      if (target.type !== "bytes20" && target.type !== "address") {
        this.panic("Target of call expression was not an address");
      } else if (!_web3Utils.default.checkAddressChecksum(target.value)) {
        this.panic(`Checksum failed for address "${target.value}"`);
      }

      const inputs = await this.evaluateNodes(node.inputs);
      const outputs = node.outputs;

      const call = _web3EthAbi.default.encodeFunctionCall({
        name: node.callee,
        type: "function",
        inputs,
        outputs
      }, inputs.map(input => input.value));

      const returnType = outputs[0].type;
      return this.eth.call({
        to: target.value,
        data: call
      }).then(data => new TypedValue(returnType, _web3EthAbi.default.decodeParameter(returnType, data)));
    }

    if (node.type === "HelperFunction") {
      const helperName = node.name;

      if (!this.helpers.exists(helperName)) {
        this.panic(`${helperName} helper function is not defined`);
      }

      const inputs = await this.evaluateNodes(node.inputs);
      const result = await this.helpers.execute(helperName, inputs, {
        eth: this.eth,
        evaluator: this
      });
      return new TypedValue(result.type, result.value);
    }

    if (node.type === "Identifier") {
      if (node.value === "self") {
        return this.to;
      }

      if (!this.bindings.hasOwnProperty(node.value)) {
        this.panic(`Undefined binding "${node.value}"`);
      }

      const binding = this.bindings[node.value];
      return new TypedValue(binding.type, binding.value);
    }
  }
  /**
   * Evaluate the entire AST.
   *
   * @return {*}
   */


  async evaluate() {
    const evaluatedNodes = await this.evaluateNodes(this.ast.body);

    if (this.returnType === "object") {
      return evaluatedNodes;
    }

    return evaluatedNodes.join("");
  }
  /**
   * Report an error and abort evaluation.
   *
   * @param  {string} msg
   */


  panic(msg) {
    throw new Error(`Error: ${msg}`);
  }

}
/**
 * Evaluates an AST
 *
 * @memberof radspec/evaluator
 * @param {radspec/parser/AST} ast The AST to evaluate
 * @param {radspec/Bindings} bindings An object of bindings and their values
 * @param {?Object} options An options object
 * @param {?string} options.ethNode The URL to an Ethereum node
 * @param {?string} options.to The destination address for this expression's transaction
 * @return {string}
 */


exports.Evaluator = Evaluator;

function evaluate(ast, bindings, options) {
  return new Evaluator(ast, bindings, options).evaluate();
}
//# sourceMappingURL=index.js.map