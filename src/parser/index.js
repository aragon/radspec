const PARSER_STATE = {
  OK: 'OK',
  ERROR: 'ERROR'
}

class Parser {
  constructor (tokens) {
    this.state = PARSER_STATE.OK

    this.tokens = tokens
    this.cursor = 0
  }

  consume () {
    this.cursor++

    return this.tokens[this.cursor - 1]
  }

  previous () {
    return this.tokens[this.cursor - 1]
  }

  peek () {
    return this.tokens[this.cursor]
  }

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

  unary () {
    if (this.matches('BANG', 'MINUS')) {
      let operator = this.previous().type
      let right = this.unary()

      return {
        type: 'UnaryExpression',
        right: right
      }
    }

    return this.primary()
  }

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

    if (this.matches('IDENTIFIER')) {
      let node = {
        type: 'Identifier',
        value: this.previous().value
      }

      // TODO Handle calls (`foo(): string` and `xyz.foo(): string`)

      return node
    }

    this.cursor++
  }

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

  eof () {
    return this.cursor >= this.tokens.length
  }

  report (error) {
    this.state = PARSER_STATE.ERROR
    console.error(
      `Error (${this.cursor}): ${error}`
    )
  }
}

module.exports = {
  Parser,

  parse (tokens) {
    return new Parser(tokens).parse()
  }
}
