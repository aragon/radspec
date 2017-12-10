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

class Scanner {
  constructor (source) {
    this.state = SCANNER_STATE.OK
    this.isInExpression = false

    this.source = source
    this.cursor = 0

    this.tokens = []
  }

  scanToken () {
    const current = this.consume()

    // We haven't hit a tick yet, so we're not in an expression
    if (!this.isInExpression) {
      // Scan until tick
      let monologue = current
      while (this.peek() !== '`' && !this.eof()) {
        monologue += this.consume()
      }
      this.emitToken('MONOLOGUE', monologue)

      // If we did not hit EOF (i.e. we hit a tick) then we enter
      // an expression and consume the tick
      if (!this.eof()) {
        this.isInExpression = true
        this.consume()
      }
      return
    }

    switch (current) {
      case '`':
        this.isInExpression = false
        break
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
      case '!':
        this.emitToken(this.match('=') ? 'BANG_EQUAL' : 'BANG')
        break
      case '=':
        this.emitToken(this.match('=') ? 'EQUAL_EQUAL' : 'EQUAL')
        break
      case '<':
        this.emitToken(this.match('=') ? 'LESS_EQUAL' : 'LESS')
        break
      case '>':
        this.emitToken(this.match('=') ? 'GREATER_EQUAL' : 'GREATER')
        break
      case ' ':
      case '\r':
      case '\t':
        break
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

  emitToken (type, value) {
    this.tokens.push({
      type,
      value
    })
  }

  consume () {
    this.cursor++

    return this.source[this.cursor - 1]
  }

  peek () {
    return this.source[this.cursor]
  }

  matches (expected) {
    if (this.eof()) return false
    if (this.peek() !== expected) {
      return false
    }

    this.cursor++
    return true
  }

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

  eof () {
    return this.cursor >= this.source.length
  }

  report (error) {
    this.state = SCANNER_STATE.ERROR
    console.error(
      `Error (${this.cursor}): ${error}`
    )
  }
}

module.exports = {
  Scanner,

  scan (source) {
    return new Scanner(source).scan()
  }
}
