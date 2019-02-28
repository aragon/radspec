/**
 * @module radspec/scanner
 */
import types from '../types';

/**
 * Enum for scanner state.
 *
 * @readonly
 * @enum {string}
 */
const SCANNER_STATE = {
  OK: 'OK',
  ERROR: 'ERROR',
};

/**
 * A scanner that identifies tokens in a source string.
 *
 * @class Scanner
 * @param {string} source The source code
 * @property {string} state The state of the parser (`OK` or `ERROR`)
 * @property {string} source The source code
 * @property {number} cursor
 * @property {Array<Token>} tokens The currently identified tokens
 */
export class Scanner {
  constructor(source) {
    this.state = SCANNER_STATE.OK;
    this.isInExpression = false;

    this.source = source;
    this.cursor = 0;

    this.tokens = [];
  }

  /**
   * Scans a single token from source and pushes it to `Scanner.tokens`.
   *
   * @return {void}
   */
  scanToken() {
    const current = this.consume();

    if (current === '`') {
      this.isInExpression = !this.isInExpression;
      this.emitToken('TICK');
      return;
    }

    // We haven't hit a tick yet, so we're not in an expression
    if (!this.isInExpression) {
      // Scan until tick
      let monologue = current;
      while (this.peek() !== '`' && !this.eof()) {
        monologue += this.consume();
      }
      this.emitToken('MONOLOGUE', monologue);
      return;
    }

    switch (current) {
      // Single character tokens
      case '(':
        this.emitToken('LEFT_PAREN');
        break;
      case ')':
        this.emitToken('RIGHT_PAREN');
        break;
      case ',':
        this.emitToken('COMMA');
        break;
      case '.':
        this.emitToken('DOT');
        break;
      case ':':
        this.emitToken('COLON');
        break;
      case '-':
        this.emitToken('MINUS');
        break;
      case '+':
        this.emitToken('PLUS');
        break;
      case '^':
        this.emitToken('POWER');
        break;
      case '*':
        this.emitToken('STAR');
        break;
      case '/':
        this.emitToken('SLASH');
        break;
      case '%':
        this.emitToken('MODULO');
        break;
      case '?':
        this.emitToken('QUESTION_MARK');
        break;
      case '@':
        this.emitToken('AT');
        break;

      // One or two character tokens
      case '!':
        this.emitToken(this.matches('=') ? 'BANG_EQUAL' : 'BANG');
        break;
      case '=':
        this.emitToken(this.matches('=') ? 'EQUAL_EQUAL' : 'EQUAL');
        break;
      case '<':
        this.emitToken(this.matches('=') ? 'LESS_EQUAL' : 'LESS');
        break;
      case '>':
        this.emitToken(this.matches('=') ? 'GREATER_EQUAL' : 'GREATER');
        break;

      // Two character tokens
      case '|':
        if (this.matches('|')) {
          this.emitToken('DOUBLE_VERTICAL_BAR');
        } else {
          this.report(`Unexpected single "|" (expecting two)`);
        }
        break;

      // Whitespace
      case ' ':
      case '\r':
      case '\n':
      case '\t':
        break;

      // Multi-character tokens
      default:
        const NUMBERS = /[0-9]/;
        const HEX = /[0-9a-f]/i;
        if (NUMBERS.test(current)) {
          let number = current;
          let type = 'NUMBER';

          // Detect hexadecimals
          if (current === '0' && this.peek() === 'x') {
            type = 'HEXADECIMAL';
            number += this.consume();

            while (HEX.test(this.peek())) {
              number += this.consume();
            }
          } else {
            while (NUMBERS.test(this.peek())) {
              number += this.consume();
            }
          }

          this.emitToken(type, number);
          break;
        }

        const IDENTIFIERS = /[_$a-z0-9]/i;
        if (IDENTIFIERS.test(current)) {
          let identifier = current;
          while (IDENTIFIERS.test(this.peek())) {
            identifier += this.consume();
          }

          if (identifier === 'true' || identifier === 'false') {
            this.emitToken('BOOLEAN', identifier);
            break;
          }

          if (types.isType(identifier)) {
            this.emitToken('TYPE', identifier);
          } else {
            this.emitToken('IDENTIFIER', identifier);
          }
          break;
        }

        if (current === `'` || current === `"`) {
          let string = '';
          while (!this.matches(`'`) && !this.matches(`"`)) {
            string += this.consume();
          }
          this.emitToken('STRING', string);
          break;
        }

        this.report(`Unexpected character "${current}"`);
    }
  }

  /**
   * Push a token to `Scanner.tokens`
   *
   * @param {string} type The token type
   * @param {string?} value The token value
   * @return {void}
   */
  emitToken(type, value) {
    const token = { type };
    if (value) token.value = value;

    this.tokens.push(token);
  }

  /**
   * Get the current character and increase the cursor by 1
   *
   * @return {string}
   */
  consume() {
    this.cursor++;

    return this.source[this.cursor - 1];
  }

  /**
   * Get the character under the cursor without consuming it.
   *
   * @return {string}
   */
  peek() {
    return this.source[this.cursor];
  }

  /**
   * Checks if the next character matches an expected one.
   *
   * Increases the cursor by 1 if the character matches.
   *
   * @param {string} expected The character to expect
   * @return {boolean} True if the next character matches, otherise false
   */
  matches(expected) {
    if (this.eof()) return false;
    if (this.peek() !== expected) {
      return false;
    }

    this.cursor++;
    return true;
  }

  /**
   * Scans source and returns a list of tokens.
   *
   * @return {Array<Token>}
   */
  async scan() {
    while (!this.eof()) {
      this.scanToken();
    }

    if (this.state === SCANNER_STATE.ERROR) {
      console.error(`Errors encountered while scanning source`);
      return;
    }

    return this.tokens;
  }

  /**
   * Returns true if we've reached the end of source, otherwise false.
   *
   * @return {boolean}
   */
  eof() {
    return this.cursor >= this.source.length;
  }

  /**
   * Prints an error with location information to `stderr`
   * and sets the scanner state to `SCANNER_STATE.ERROR`
   *
   * @param {string} error
   * @return {void}
   */
  report(error) {
    this.state = SCANNER_STATE.ERROR;
    console.error(`Error (${this.cursor}): ${error}`);
  }
}

/**
 * Scans source and returns a list of tokens.
 *
 * @memberof radspec/scanner
 * @param  {string} source
 * @return {Array<Token>}
 */
export function scan(source) {
  return new Scanner(source).scan();
}
