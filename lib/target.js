'use strict';


const msg = {
  argTarget: 'Argument "target" must be a string or instance of Target',
};



class Target {

  constructor() {
    this._path = [];
    this._value = '';
  }


  get path() { return this._path; }


  get value() { return this._value; }


  static parse(target) {
    if (target instanceof Target) return target;

    if (typeof target !== 'string') {
      throw new TypeError(msg.argTarget);
    }


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
