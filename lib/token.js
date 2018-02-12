'use strict';

const token = {
  NONE: 0,
  FIELD_INDICATOR: 1,
  FIELD: 2,
  DIR_INDICATOR: 3,
  DIRECTION: 4,
  CONCAT: 5,
  UNKNOWN: 6,
};

Object.freeze(token);


module.exports = token;
