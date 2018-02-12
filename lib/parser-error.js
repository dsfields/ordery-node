'use strict';

class ParserError extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'ParserError';
  }
}


module.exports = ParserError;
