'use strict';

const Target = require('./target');


/**
 * A class representing an Order Expression.
 */
class Order {

  /** @private */
  constructor() {
    this._value = [];
  }


  /**
   * Gets an array containing objects that define an order-by clause.
   */
  get value() { return this._value; }


  /**
   * Factory method for creating instances of Order.  This method seeds the
   * resulting Order instance with an ascending order clause with the given
   * target.
   *
   * @param {string|Target} target
   */
  static asc(target) {
    const order = new Order();
    order.asc(target);
    return order;
  }


  /**
   * Factory method for creating instances of Order.  This method seeds the
   * resulting Order instance with an descending order clause with the given
   * target.
   *
   * @param {string|Target} target
   */
  static desc(target) {
    const order = new Order();
    order.desc(target);
    return order;
  }


  _clause(targ, direction) {
    const target = Target.parse(targ);
    this._value.push({
      target,
      direction,
    });
    return this;
  }


  /**
   * A method that appends an ascending order clause to the Order instance using
   * the given target.
   *
   * @param {string|Target} target
   */
  asc(target) {
    return this._clause(target, 'asc');
  }


  /**
   * A method that appends an descending order clause to the Order instance
   * using the given target.
   *
   * @param {string|Target} target
   */
  desc(target) {
    return this._clause(target, 'desc');
  }


  /**
   * Converts the Order instance into a JSON object.
   */
  toJSON() {
    return this._value;
  }

}


module.exports = Order;
