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
   * @return {Node}
   */
  comparison () {
    let node = this.addition()

    while (this.matches('GREATER', 'GREATER_EQUAL', 'LESS', 'LESS_EQUAL')) {
      let operator = this.previous().type
      let right = this.addition()
      node = {
        type: 'ComparisonExpression',
        operator,
        left: node,
        right
      }
    }

    return node
  }

  /**
   * Try to parse arithmetic operators.
   *
   * @return {Node}
   */
  addition () {
    let node = this.multiplication()

    while (this.matches('MINUS', 'PLUS')) {
      let operator = this.previous().type
      let right = this.multiplication()
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
   * @return {Node}
   */
  multiplication () {
    let node = this.unary()

    while (this.matches('SLASH', 'STAR')) {
      let operator = this.previous().type
      let right = this.unary()

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
   * @return {Node}
   */
  unary () {
    if (this.matches('BANG', 'MINUS')) {
      let operator = this.previous().type
      let right = this.unary()

      return {
        type: 'UnaryExpression',
        operator,
        right: right
      }
    }

    return this.identifier()
  }

  /**
   * Try to parse identifiers and call expressions.
   *
   * @return {Node}
   */
  identifier () {
    if (this.matches('IDENTIFIER')) {
      let node = {
        type: 'Identifier',
        value: this.previous().value
      }

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
          inputs: [],
          outputs: []
        }

        while (!this.eof() && !this.matches('RIGHT_PAREN')) {
          let input = this.comparison()
          if (!input.type) {
            input.type = this.type()
          } else if (this.matches('COLON')) {
            this.report(`Unexpected type (already inferred type of parameter)`)
          }

          node.inputs.push(input)

          // Break if the next character is not a comma or a right parenthesis
          // If this is true, then we are specifying more parameters without
          // delimiting them using comma.
          if (!this.matches('COMMA') &&
            this.peek().type !== 'RIGHT_PAREN') break
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

    return this.primary()
  }

  /**
   * Try to parse primaries (literals).
   *
   * @return {Node}
   */
  primary () {
    if (this.matches('NUMBER', 'STRING')) {
      let type = this.previous().type === 'NUMBER'
        ? 'NumberLiteral'
        : 'StringLiteral'

      return {
        type,
        value: this.previous().value
      }
    }

    // TODO Error out
    this.cursor++
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
   * Walk all possible paths and try to parse a single node
   * from the list of tokens.
   *
   * @return {Node}
   */
  walk () {
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
        node.body.push(this.walk())
      }

      if (this.eof()) {
        this.report('Unterminated expression')
      }

      this.matches('TICK')

      return node
    }

    return this.comparison()
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
      ast.body.push(this.walk())
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
