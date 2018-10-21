/**
 * @module radspec/parser
 */

/**
 * A token.
 * @typedef {Object} Token
 * @property {string} type The token type
 * @property {*?} value The value of the token
 */

/**
 * An AST node.
 * @typedef {Object} Node
 * @property {string} type The node type
 */
/**
 * An AST.
 * @typedef {Object} AST
 * @property {string} type
 * @property {Array<Node>} body The AST nodes
 */

/**
 * Enum for parser state.
 *
 * @readonly
 * @enum {string}
 */
const PARSER_STATE = {
  OK: 'OK',
  ERROR: 'ERROR'
}

/**
 * Parses a token list into an AST.
 *
 * @class Parser
 * @param {Array<Token>} tokens
 * @property {string} state The state of the parser (`OK` or `ERROR`)
 * @property {Array<Token>} tokens
 * @property {number} cursor
 */
class Parser {
  constructor (tokens) {
    this.state = PARSER_STATE.OK

    this.tokens = tokens
    this.cursor = 0
  }

  /**
   * Get the current token and increase the cursor by 1
   *
   * @return {Token}
   */
  consume () {
    this.cursor++

    return this.tokens[this.cursor - 1]
  }

  /**
   * Get the previous token.
   *
   * @return {Token}
   */
  previous () {
    return this.tokens[this.cursor - 1]
  }

  /**
   * Get the token under the cursor without consuming it.
   *
   * @return {Token}
   */
  peek () {
    return this.tokens[this.cursor]
  }

  /**
   * Checks if the type of the next token matches any of the expected types.
   *
   * Increases the cursor by 1 if the token matches.
   *
   * @param {...string} expected The expected types
   * @return {boolean} True if the next token matches, otherwise false
   */
  matches (...expected) {
    if (this.eof()) return false
    for (let type of expected) {
      if (this.peek().type === type) {
        this.cursor++
        return true
      }
    }

    return false
  }

  /**
   * Try to parse comparison operators.
   *
   * @param  {Array<Node>} astBody Subtree of AST being walked
   * @return {Node}
   */
  comparison (astBody) {
    let node = this.addition(astBody)

    while (this.matches('GREATER', 'GREATER_EQUAL', 'LESS', 'LESS_EQUAL', 'EQUAL_EQUAL', 'BANG_EQUAL')) {
      let operator = this.previous().type
      let right = this.addition(astBody)
      node = {
        type: 'ComparisonExpression',
        operator,
        left: node,
        right
      }
    }

    if (this.matches('QUESTION_MARK')) {
      node = {
        type: 'TernaryExpression',
        predicate: node,
        left: this.comparison(astBody)
      }

      if (!this.matches('COLON')) {
        this.report('Half-baked ternary (expected colon)')
      }

      node.right = this.comparison(astBody)
    }

    if (this.matches('DOUBLE_VERTICAL_BAR')) {
      node = {
        left: node,
        right: this.comparison(),
        type: 'DefaultExpression'
      }
    }

    return node
  }

  /**
   * Try to parse arithmetic operators.
   *
   * @param  {Array<Node>} astBody Subtree of AST being walked
   * @return {Node}
   */
  addition (astBody) {
    let node = this.multiplication(astBody)

    while (this.matches('MINUS', 'PLUS')) {
      let operator = this.previous().type
      let right = this.multiplication(astBody)
      node = {
        type: 'BinaryExpression',
        operator,
        left: node,
        right
      }
    }

    return node
  }

  /**
   * Try to parse binary operators.
   *
   * @param  {Array<Node>} astBody Subtree of AST being walked
   * @return {Node}
   */
  multiplication (astBody) {
    let node = this.power(astBody)

    while (this.matches('SLASH', 'STAR', 'MODULO')) {
      let operator = this.previous().type
      let right = this.power(astBody)

      node = {
        type: 'BinaryExpression',
        operator,
        left: node,
        right
      }
    }

    return node
  }

  /**
   * Try to parse exponential operators.
   *
   * @param  {Array<Node>} astBody Subtree of AST being walked
   * @return {Node}
   */
  power (astBody) {
    let node = this.unary(astBody)

    while (this.matches('POWER')) {
      let operator = this.previous().type
      let right = this.unary(astBody)

      node = {
        type: 'BinaryExpression',
        operator,
        left: node,
        right
      }
    }

    return node
  }

  /**
   * Try to parse unary operators.
   *
   * @param  {Array<Node>} astBody Subtree of AST being walked
   * @return {Node}
   */
  unary (astBody) {
    if (this.matches('BANG', 'MINUS')) {
      let operator = this.previous().type
      let right = this.unary(astBody)

      return {
        type: 'UnaryExpression',
        operator,
        right: right
      }
    }

    return this.identifier(astBody)
  }

  /**
   * Try to parse identifiers and call expressions.
   *
   * @param  {Array<Node>} astBody Subtree of AST being walked
   * @return {Node}
   */
  identifier (astBody) {
    let node

    if (this.matches('IDENTIFIER')) {
      node = {
        type: 'Identifier',
        value: this.previous().value
      }
    }

    if (!node) {
      const previousNode = astBody.length && astBody[astBody.length - 1]
      if (previousNode && (
        previousNode.type === 'Identifier' ||
        previousNode.type === 'GroupedExpression' ||
        previousNode.type === 'CallExpression'
      )) {
        node = previousNode
        // Consume the last node as part of this node
        astBody.pop()
      }
    }

    if (node) {
      while (this.matches('DOT')) {
        let property = this.consume().value

        node = {
          type: 'PropertyAccessExpression',
          target: node,
          property
        }
      }

      if (this.matches('LEFT_PAREN')) {
        node = {
          type: 'CallExpression',
          target: node.target,
          callee: node.property,
          inputs: this.functionInputs(astBody),
          outputs: []
        }

        if (this.eof()) {
          // TODO Better error
          this.report('Unterminated call expression')
        }

        node.outputs.push({
          type: this.type()
        })
      }

      return node
    }

    return this.helper(astBody)
  }

  /**
   * Try to parse helper functions
   *
   * @param  {Array<Node>} astBody Subtree of AST being walked
   * @return {Node}
   */
  helper (astBody) {
    if (this.matches('AT')) {
      const identifier = this.consume()
      const name = identifier.value

      if (identifier.type !== 'IDENTIFIER') {
        this.report(`Invalid helper function name '${name}' provided after @`)
      }

      let node = {
        type: 'HelperFunction',
        name: name
      }

      if (this.matches('LEFT_PAREN')) {
        node.inputs = this.functionInputs(astBody)
      } else {
        // There is actually no good reason not to allow calling a helper without ()
        // this.report(`Expected '(' for executing helper function`)
      }

      return node
    }

    return this.primary(astBody)
  }

  /**
   * Try to parse primaries (literals).
   *
   * @param  {Array<Node>} astBody Subtree of AST being walked
   * @return {Node}
   */
  primary (astBody) {
    if (this.matches('NUMBER', 'STRING', 'HEXADECIMAL')) {
      let type = {
        NUMBER: 'NumberLiteral',
        STRING: 'StringLiteral',
        HEXADECIMAL: 'BytesLiteral'
      }[this.previous().type]

      return {
        type,
        value: this.previous().value
      }
    }

    if (this.matches('LEFT_PAREN')) {
      let expression

      do {
        // Keep munching expressions in the context of the current expression
        expression = this.comparison(expression ? [expression] : [])
      } while (!this.eof() && !this.matches('RIGHT_PAREN'))

      if (this.eof()) {
        this.report('Unterminated grouping')
      }

      return {
        type: 'GroupedExpression',
        body: expression
      }
    }

    this.report(`Unknown token "${this.consume().type}"`)
  }

  /**
   * Try to parse a type.
   *
   * @return {string} The type
   */
  type () {
    if (!this.matches('COLON') &&
      this.peek().type !== 'TYPE') {
      // TODO Better error
      this.report(`Expected a type, got "${this.peek().type}"`)
    }

    return this.consume().value
  }

  /**
   * Try to parse a type.
   *
   * @param  {Array<Node>} astBody Subtree of AST being walked
   * @return {Array<Node>}
   */
  functionInputs (astBody) {
    let inputs = []

    while (!this.eof() && !this.matches('RIGHT_PAREN')) {
      let input = this.comparison(astBody)
      if (!input.type) {
        input.type = this.type()
      } else if (this.matches('COLON')) {
        this.report(`Unexpected type (already inferred type of parameter)`)
      }

      inputs.push(input)

      // Break if the next character is not a comma or a right parenthesis
      // If this is true, then we are specifying more parameters without
      // delimiting them using comma.
      if (!this.matches('COMMA') &&
        this.peek().type !== 'RIGHT_PAREN') break
    }

    return inputs
  }

  /**
   * Walk all possible paths and try to parse a single node
   * from the list of tokens.
   *
   * @param  {Array<Node>} astBody Subtree of AST being walked
   * @return {Node}
   */
  walk (astBody) {
    let token = this.peek()

    if (token.type === 'MONOLOGUE') {
      return {
        type: 'MonologueStatement',
        value: this.consume().value
      }
    }

    if (token.type === 'TICK') {
      let node = {
        type: 'ExpressionStatement',
        body: []
      }

      this.matches('TICK')

      while (!this.eof() && this.peek().type !== 'TICK') {
        node.body.push(this.walk(node.body))
      }

      if (this.eof()) {
        this.report('Unterminated expression')
      }

      this.matches('TICK')

      return node
    }

    return this.comparison(astBody)
  }

  /**
   * Walks the token list and returns an AST.
   *
   * @return {AST} The AST
   */
  async parse () {
    let ast = {
      type: 'Program',
      body: []
    }

    while (!this.eof()) {
      ast.body.push(this.walk(ast.body))
    }

    if (this.state === PARSER_STATE.ERROR) {
      console.error(`Errors encountered while parsing source`)
      return ast
    }

    return ast
  }

  /**
   * Returns true if we've reached the end of the token list, otherwise false.
   *
   * @return {boolean}
   */
  eof () {
    return this.cursor >= this.tokens.length
  }

  /**
   * Prints an error with location information to `stderr`
   * and sets the parser state to `PARSER_STATE.ERROR`
   *
   * @param {string} error
   * @return {void}
   */
  report (error) {
    this.state = PARSER_STATE.ERROR
    console.error(
      `Error (${this.cursor}): ${error}`
    )
  }
}

module.exports = {
  Parser,

  /**
   * Walks token list and returns an AST.
   *
   * @memberof radspec/parser
   * @param  {Array<Token>} tokens
   * @return {AST} The AST
   */
  parse (tokens) {
    return new Parser(tokens).parse()
  }
}
