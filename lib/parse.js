'use strict';

const elv = require('elv');

const Direction = require('./direction');
const Lexer = require('./lexer');
const Order = require('./order');
const Target = require('./target');
const Token = require('./token');


class Parser {

  constructor(expression) {
    this._lexer = new Lexer(expression);
  }


  _target() {
    return Target.parse(this._lexer);
  }


  _direction() {
    if (!this.lexer.accept(Token.DIR_INDICATOR)) return Direction.ASC;
    this.lexer.expectNext();
    this.lexer.expect(Token.DIRECTION);
    return this._lexer.current.value;
  }


  _order(parent) {
    const target = this._target();
    const direction = this._direction();

    const order = (elv(parent))
      ? parent[direction](target)
      : Order[direction](target);

    if (this._lexer.next() && this.lexer.expect(Token.CONCAT)) {
      this.lexer.expectNext();
      this._order(order);
    }

    return order;
  }


  parse() {
    this.lexer.expectNext();
    return this._order();
  }

}


/**
 * Parses an Ordery Expression string into an instance of Order.
 *
 * @param {string} expression
 */
module.exports = (expression) => {
  const parser = new Parser(expression);
  return parser.parse();
};
