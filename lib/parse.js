'use strict';

const Lexer = require('./lexer');


function parse(expression) {
  const lexer = new Lexer(expression);
}


module.exports = parse;
