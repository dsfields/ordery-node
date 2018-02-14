'use strict';

const Order = require('./order');
const parse = require('./parse');
const ParserError = require('./parser-error');
const Target = require('./target');


/**
 * The ordery module.
 *
 * @module
 */
module.exports = {
  errors: { ParserError },
  Order,
  parse,
  Target,
};
