'use strict';

/**
 * Enumerated value of expression parser tokens.
 *
 * @enum
 * @readonly
 */
const token = {
  /**
   * Empty token.
   * @readonly
   */
  NONE: 0,

  /**
   * Indicates a field in a JSON pointer is being specified.
   * @readonly
   */
  FIELD_INDICATOR: 1,

  /**
   * The name of a field in a JSON pointer.
   * @readonly
   */
  FIELD: 2,

  /**
   * Indicates a sort direction is being specied.
   */
  DIR_INDICATOR: 3,

  /**
   * A sort direction.
   */
  DIRECTION: 4,

  /**
   * Indicates a successive sort clause is being added to the expression.
   */
  CONCAT: 5,

  /**
   * Unknown token.
   */
  UNKNOWN: 6,
};

Object.freeze(token);


module.exports = token;
