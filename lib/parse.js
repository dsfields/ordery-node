'use strict';

const elv = require('elv');

const Direction = require('./direction');
const Lexer = require('./lexer');
const Order = require('./order');
const Target = require('./target');
const Token = require('./token');


/**
 * @typedef {object} ParserResult
 * @prop {ParserError|null} error
 * @prop {Order|null} value
 */


/**
 * A recursive descent parser for Ordrly Expressions.
 */
class Parser {

  /**
   * Constructs a new instance of Parser.
   *
   * @param {string} expression
   */
  constructor(expression) {
    this._lexer = new Lexer(expression);
  }


  /**
   * Parses a target out of an Orderly Expression.
   *
   * @private
   *
   * @returns {Target}
   */
  _target() {
    return Target.parse(this._lexer);
  }


  /**
   * Parses a Direction out of an Orderly Expression.  Returns the default if
   * no Direction was found in the expression.
   *
   * @private
   *
   * @returns {Direction}
   */
  _direction() {
    if (!this._lexer.accept(Token.DIR_INDICATOR)) return Direction.ASC;
    this._lexer.expectNext();
    this._lexer.expect(Token.DIRECTION);
    const { value } = this._lexer.current;
    this._lexer.next();
    return value;
  }


  /**
   * Parses a full sort clause out of an Orderly Expression.
   *
   * @private
   *
   * @param {Order} [parent]
   *
   * @returns {Order}
   */
  _order(parent) {
    const target = this._target();
    const direction = this._direction();

    const order = (elv(parent))
      ? parent[direction](target)
      : Order[direction](target);

    if (!this._lexer.isEnd) {
      this._lexer.expect(Token.CONCAT);
      this._lexer.expectNext();
      this._order(order);
    }

    return order;
  }


  /**
   * Parses an Orderly Expression.
   *
   * @returns {Order}
   */
  parse() {
    this._lexer.expectNext();
    return this._order();
  }

}


/**
 * Parses an Ordery Expression string into an instance of Order.
 *
 * @param {string} expression
 *
 * @returns {ParserResult}
 */
module.exports = (expression) => {
  const parser = new Parser(expression);
  const result = {
    error: null,
    value: null,
  };

  try {
    result.value = parser.parse();
  } catch (err) {
    result.error = err;
  }

  return result;
};
