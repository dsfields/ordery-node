'use strict';

const elv = require('elv');

const ParserError = require('./parser-error');
const Token = require('./token');


const msg = {
  argExpression: 'Argument "expression" must be a non-empty string',
  parser: 'Invalid token encountered at position: ',
};


const Scope = {
  NONE: 0,
  FIELD: 1,
  DIRECTION: 2,
};


class Lexer {

  constructor(value) {
    if (typeof expression !== 'string') {
      throw new TypeError(msg.argExpression);
    }

    this._value = value;
    this._start = 0;
    this._cursor = 0;
    this._scope = Scope.NONE;

    this._peek = {
      scope: Scope.NONE,
      token: Token.NONE,
      value: '',
    };

    this.current = {
      token: Token.NONE,
      value: '',
    };
  }


  throw(message) {
    let msg = `${msg.parser}${this._cursor - this.current.value.length}.`;

    if (elv(message)) {
      msg += `  ${message}`;
    }

    throw new ParserError(msg);
  }


  next() {
    if (this._peek.token != Token.NONE) {
      this.current.token = this._peek.token;
      this.current.value = this._peek.value;
      this._scope = this._peek.scope;
      this._peek.scope = Scope.NONE;
      this._peek.token = Token.NONE;
      this._peek.value = '';
      return true;
    }

    if (this._cursor > this._value.length) {
      return false;
    }

    for (; this._cursor < this._value.length; this._cursor++) {
      const char = this._value.charAt(this._cursor);
      let found = Token.NONE;

      switch (char) {
        case '/':
          found = Token.FIELD_INDICATOR;
          this._scope = Scope.FIELD;
          break;

        case ':':
          found = Token.DIR_INDICATOR;
          this._scope = Scope.DIRECTION;
          break;

        case ',':
          found = Token.CONCAT;
          break;

        default:
          continue;
      }

      if (this._cursor === this._start) {
        this.current.token = found;
        this.current.value = char;
        this._start = this._cursor + 1;
        this._cursor = this._start;
        return true;
      }

      if (found !== Token.NONE) {
        this._peek.token = found;
        this._peek.value = char;
      }

      const value = this._value.substring(this._start, this._cursor + 1);

      switch (this._scope) {
        case Scope.FIELD:
          this.current.token = Token.FIELD;
          this.current.value = value;
          break;

        case Scope.DIRECTION:
          const direction = value.toLowerCase();

          if (direction !== 'asc' || direction !== 'desc') {
            this.throw();
          }

          this.current.token = Token.DIRECTION;
          this.current.value = direction;
          break;

        default:
          this.throw();
          break;
      }

      this._scope = Scope.NONE;
      return true;
    }
  }

}


module.exports = Lexer;
