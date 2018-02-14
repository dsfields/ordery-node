'use strict';

const elv = require('elv');

const Direction = require('./direction');
const ParserError = require('./parser-error');
const Token = require('./token');


const msg = {
  argExpression: 'Argument "expression" must be a non-empty string',
  parser: 'Invalid token encountered at position: ',
};


const expectMsg = {};
expectMsg[Token.CONCAT] = 'Expected a "," token.';
expectMsg[Token.DIR_INDICATOR] = 'Expected a ":" token.';
expectMsg[Token.DIRECTION] = 'Expected an "asc" or "desc" token.';
expectMsg[Token.FIELD] = 'Expected a JSON pointer field token.';
expectMsg[Token.FIELD_INDICATOR] = 'Expected a "/" token.';
expectMsg[Token.UNKNOWN] = 'Unknown token encountered.';
expectMsg[Token.NONE] = '';


/**
 * @typedef {object} TokenInfo
 * @prop {Token} token
 * @prop {Token} terminator
 * @prop {string} value
 */


/**
 * Tokenizes a given Ordery expression.
 *
 * @prop {TokenInfo} current
 */
class Lexer {

  /**
   * Constructors a new instance of Lexer.
   *
   * @param {string} value
   */
  constructor(value) {
    if (typeof value !== 'string' || value.length === 0) {
      throw new TypeError(msg.argExpression);
    }

    this._value = value;
    this._cursor = 0;

    this.current = {
      token: Token.NONE,
      terminator: Token.NONE,
      value: '',
    };
  }


  /**
   * Gets a value indicating whether or not the Lexer has reached the end of the
   * value.
   */
  get isEnd() { return this._cursor >= this._value.length; }


  /**
   * Throws a parser error indicating the position at which the error occurred.
   * Addtional error messages is added if provided.
   *
   * @param {string} [message]
   */
  throw(message) {
    let errMsg = `${msg.parser}${this._cursor - this.current.value.length}.`;

    if (elv(message)) {
      errMsg += `  ${message}`;
    }

    throw new ParserError(errMsg);
  }


  /**
   * Analyzes a token against the current Lexer context to determine its token
   * type.
   *
   * @private
   *
   * @param {Token} context
   * @param {string} value
   * @param {Token} terminator
   * @param {boolean} isSelfTerm
   *
   * @returns {TokenInfo}
   */
  _analyze(context, value, terminator, isSelfTerm) {
    const result = {
      length: value.length,
      terminator,
      token: Token.UNKNOWN,
      value,
    };

    if (context === Token.DIR_INDICATOR && !isSelfTerm) {
      result.value = value.toLowerCase();
      result.token = Token.DIRECTION;

      if (result.value !== Direction.ASC && result.value !== Direction.DESC) {
        this.throw();
      }

      return result;
    }

    if (context === Token.FIELD_INDICATOR && !isSelfTerm) {
      result.token = Token.FIELD;
      const val = parseInt(result.value);
      if (!Number.isNaN(val)) result.value = val;
      return result;
    }

    if (isSelfTerm) {
      result.token = terminator;
      return result;
    }

    return result;
  }


  /**
   * Parses a token from an Order Expression at the current cursor position.
   *
   * @private
   *
   * @param {Token} context
   *
   * @returns {TokenInfo}
   */
  _peek(context) {
    let terminator = Token.NONE;
    let isSelfTerm = false;
    let i = this._cursor;

    for (; i < this._value.length; i++) {
      const charCode = this._value.charCodeAt(i);

      switch (charCode) {
        case 0x2F: // forward slash
          terminator = Token.FIELD_INDICATOR;
          break;

        case 0x3A: // colon
          terminator = Token.DIR_INDICATOR;
          break;

        case 0x2C: // comma
          terminator = Token.CONCAT;
          break;

        default:
          continue;
      }

      if (i === this._cursor) {
        isSelfTerm = terminator !== Token.NONE;
        i++;
      }

      break;
    }

    const value = this._value.substring(this._cursor, i);
    return this._analyze(context, value, terminator, isSelfTerm);
  }


  /**
   * Advances the Lexer's cursor position, and sets the current token.
   *
   * @returns {boolean} Whether or not the Lexer has reached the end.
   */
  next() {
    if (this.isEnd) return false;

    const result = this._peek(this.current.terminator);
    this._cursor += result.length;
    this.current = result;

    return true;
  }


  /**
   * Determines whether or not the current token is a specific token.
   *
   * @param {Token} token
   *
   * @returns {boolean}
   */
  accept(token) {
    return this.current.token === token;
  }


  /**
   * Asserts whether or not the current token is a specific token.
   *
   * @param {Token} token
   *
   * @returns {boolean}
   */
  expect(token) {
    if (!this.accept(token)) this.throw(expectMsg[token]);
    return true;
  }


  /**
   * Advances the Lexer's cursor position, and sets the current token.  If the
   * Lexer cannot advance, a ParserError is thrown.
   *
   * @returns {boolean}
   */
  expectNext() {
    if (!this.next()) this.throw();
    return true;
  }

}


module.exports = Lexer;
