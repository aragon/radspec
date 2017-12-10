const SCANNER_STATE = {
  OK: 'OK',
  ERROR: 'ERROR'
}

// TODO Probably make this a bit easier on the eyes
const TYPES = [
  // Boolean
  'bool',

  // Signed integers
  'int',
  'int8',
  'int16',
  'int24',
  'int32',
  'int64',
  'int72',
  'int80',
  'int88',
  'int96',
  'int104',
  'int112',
  'int120',
  'int128',
  'int136',
  'int144',
  'int152',
  'int160',
  'int168',
  'int172',
  'int180',
  'int188',
  'int196',
  'int204',
  'int212',
  'int216',
  'int224',
  'int232',
  'int240',
  'int248',
  'int256',

  // Unsigned integers
  'uint',
  'uint8',
  'uint16',
  'uint24',
  'uint32',
  'uint64',
  'uint72',
  'uint80',
  'uint88',
  'uint96',
  'uint104',
  'uint112',
  'uint120',
  'uint128',
  'uint136',
  'uint144',
  'uint152',
  'uint160',
  'uint168',
  'uint172',
  'uint180',
  'uint188',
  'uint196',
  'uint204',
  'uint212',
  'uint216',
  'uint224',
  'uint232',
  'uint240',
  'uint248',
  'uint256',

  // TODO Fixed point types
  // Address
  'address',

  // Bytes
  'byte',
  'bytes1',
  'bytes2',
  'bytes3',
  'bytes4',
  'bytes5',
  'bytes6',
  'bytes7',
  'bytes8',
  'bytes9',
  'bytes10',
  'bytes11',
  'bytes12',
  'bytes13',
  'bytes14',
  'bytes15',
  'bytes16',
  'bytes17',
  'bytes18',
  'bytes19',
  'bytes20',
  'bytes21',
  'bytes22',
  'bytes23',
  'bytes24',
  'bytes25',
  'bytes26',
  'bytes27',
  'bytes28',
  'bytes29',
  'bytes30',
  'bytes31',
  'bytes32',

  // Strings
  'string'
]

/**
 * A scanner that identifies tokens in a source string.
 */
class Scanner {
  /**
   * Create a scanner.
   *
   * @param  {string} source
   */
  constructor (source) {
    this.state = SCANNER_STATE.OK
    this.isInExpression = false

    this.source = source
    this.cursor = 0

    this.tokens = []
  }

  /**
   * Scans a single token from source and pushes it to `Scanner.tokens`.
   *
   * @return {void}
   */
  scanToken () {
    const current = this.consume()

    if (current === '`') {
      this.isInExpression = !this.isInExpression
      this.emitToken('TICK')
      return
    }

    // We haven't hit a tick yet, so we're not in an expression
    if (!this.isInExpression) {
      // Scan until tick
      let monologue = current
      while (this.peek() !== '`' && !this.eof()) {
        monologue += this.consume()
      }
      this.emitToken('MONOLOGUE', monologue)
      return
    }

    switch (current) {
      // Single character tokens
      case '(':
        this.emitToken('LEFT_PAREN')
        break
      case ')':
        this.emitToken('RIGHT_PAREN')
        break
      case ',':
        this.emitToken('COMMA')
        break
      case '.':
        this.emitToken('DOT')
        break
      case ':':
        this.emitToken('COLON')
        break
      case '-':
        this.emitToken('MINUS')
        break
      case '+':
        this.emitToken('PLUS')
        break
      case '*':
        this.emitToken('STAR')
        break
      case '/':
        this.emitToken('SLASH')
        break

      // One or two character tokens
      case '!':
        this.emitToken(this.matches('=') ? 'BANG_EQUAL' : 'BANG')
        break
      case '=':
        this.emitToken(this.matches('=') ? 'EQUAL_EQUAL' : 'EQUAL')
        break
      case '<':
        this.emitToken(this.matches('=') ? 'LESS_EQUAL' : 'LESS')
        break
      case '>':
        this.emitToken(this.matches('=') ? 'GREATER_EQUAL' : 'GREATER')
        break

      // Whitespace
      case ' ':
      case '\r':
      case '\n':
      case '\t':
        break

      // Multi-character tokens
      default:
        const IDENTIFIERS = /[_a-z]/i
        if (IDENTIFIERS.test(current)) {
          let identifier = current
          while (IDENTIFIERS.test(this.peek())) {
            identifier += this.consume()
          }

          if (TYPES.includes(identifier)) {
            this.emitToken('TYPE', identifier)
          } else {
            this.emitToken('IDENTIFIER', identifier)
          }
          break
        }

        const NUMBERS = /[0-9]/
        if (NUMBERS.test(current)) {
          let number = current
          while (NUMBERS.test(this.peek())) {
            number += this.consume()
          }
          this.emitToken('NUMBER', number)
          break
        }

        this.report(`Unexpected character "${current}"`)
    }
  }

  /**
   * Push a token to `Scanner.tokens`
   *
   * @param {string} type The token type
   * @param {string?} value The token value
   * @return {void}
   */
  emitToken (type, value) {
    let token = { type }
    if (value) token.value = value

    this.tokens.push(token)
  }

  /**
   * Get the current character and increase the cursor by 1
   *
   * @return {string}
   */
  consume () {
    this.cursor++

    return this.source[this.cursor - 1]
  }

  /**
   * Get the character under the cursor without consuming it.
   *
   * @return {string}
   */
  peek () {
    return this.source[this.cursor]
  }

  /**
   * Checks if the next character matches an expected one.
   *
   * Increases the cursor by 1 if the character matches.
   *
   * @param {string} expected The character to expect
   * @return {bool} True if the next character matches, otherise false
   */
  matches (expected) {
    if (this.eof()) return false
    if (this.peek() !== expected) {
      return false
    }

    this.cursor++
    return true
  }

  /**
   * Scans source and returns a list of tokens.
   *
   * @return {Array<Object>}
   */
  async scan () {
    while (!this.eof()) {
      this.scanToken()
    }

    if (this.state === SCANNER_STATE.ERROR) {
      console.error(`Errors encountered while scanning source`)
      return
    }

    return this.tokens
  }

  /**
   * Returns true if we've reached the end of source, otherwise false.
   *
   * @return {bool}
   */
  eof () {
    return this.cursor >= this.source.length
  }

  /**
   * Prints an error with location information to `stderr`
   * and sets the scanner state to `SCANNER_STATE.ERROR`
   *
   * @param {string} error
   * @return {void}
   */
  report (error) {
    this.state = SCANNER_STATE.ERROR
    console.error(
      `Error (${this.cursor}): ${error}`
    )
  }
}

module.exports = {
  Scanner,

  /**
   * Scans source and returns a list of tokens.
   *
   * @param  {string} source
   * @return {Array<Object>}
   */
  scan (source) {
    return new Scanner(source).scan()
  }
}
