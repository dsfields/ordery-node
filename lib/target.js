'use strict';

const elv = require('elv');

const Lexer = require('./lexer');
const Token = require('./token');


const msg = {
  argTarget: 'Argument "target" must be a string or instance of Target',
};


/**
 * Represents a field target in a document.
 */
class Target {

  /** @private */
  constructor(path, value) {
    this._path = path;
    this._value = elv.coalesce(value, () => '/' + path.join('/'));
  }


  /**
   * Gets an array of strings and numbers whose order represents the path to
   * the target field in a document.
   */
  get path() { return this._path; }


  /**
   * Gets the full, original JSON pointer.
   */
  get value() { return this._value; }


  /**
   * Parses a given string into a Target.
   *
   * @param {string} target
   */
  static parse(target) {
    if (target instanceof Target) return target;

    let lexer;
    let strict = true;
    let value = null;
    const path = [];

    if (target instanceof Lexer) {
      lexer = target;
      strict = false;
    } else if (typeof target === 'string') {
      value = target;
      lexer = new Lexer(target);
      lexer.expectNext();
    } else {
      throw new TypeError(msg.argTarget);
    }

    lexer.expect(Token.FIELD_INDICATOR);

    do {
      lexer.expectNext();
      lexer.expect(Token.FIELD);
      path.push(lexer.current.value);
    } while (
      lexer.next()
      && (
        (strict && lexer.expect(Token.FIELD_INDICATOR))
        || (!strict && lexer.accept(Token.FIELD_INDICATOR))
      )
    );

    return new Target(path, value);
  }


  /**
   * Converts the Target instance into a JSON object.
   */
  toJSON() {
    return {
      path: this._path,
      value: this._value,
    };
  }

}


module.exports = Target;
