'use strict';

/**
 * An error encountered during parsing due to an invalid Ordery Expresssion.
 *
 * @extends {Error}
 */
class ParserError extends Error {

  /**
   * Constructs a new instance of ParserError using the given error message.
   *
   * @param {string} message
   */
  constructor(message) {
    super(message);
    this.name = 'ParserError';
  }

}


module.exports = ParserError;
