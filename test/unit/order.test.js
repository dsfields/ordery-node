'use strict';

const { assert } = require('chai');

const Direction = require('../../lib/direction');
const Order = require('../../lib/order');
const Target = require('../../lib/target');


describe('Order', function() {
  describe('.asc', function() {
    it('throws if target not string or Target', function() {
      assert.throws(() => {
        Order.asc(42);
      }, TypeError);
    });

    it('returns instance of Order', function() {
      const result = Order.asc('/foo');
      assert.instanceOf(result, Order);
    });

    it('seeds value with ascending sort', function() {
      const result = Order.asc('/foo');
      assert.lengthOf(result.value, 1);
      assert.strictEqual(result.value[0].direction, Direction.ASC);
    });

    it('seeds value with ascending sort for target string', function() {
      const result = Order.asc('/foo/bar');
      assert.lengthOf(result.value, 1);
      assert.deepEqual(result.value[0].target.path, ['foo', 'bar']);
    });

    it('seeds value with ascending sort for Target', function() {
      const target = Target.parse('/foo/bar');
      const result = Order.asc(target);
      assert.lengthOf(result.value, 1);
      assert.strictEqual(result.value[0].target, target);
    });
  });


  describe('.desc', function() {
    it('throws if target not string or Target', function() {
      assert.throws(() => {
        Order.desc(42);
      }, TypeError);
    });

    it('returns instance of Order', function() {
      const result = Order.desc('/foo');
      assert.instanceOf(result, Order);
    });

    it('seeds value with descending sort', function() {
      const result = Order.desc('/foo');
      assert.lengthOf(result.value, 1);
      assert.strictEqual(result.value[0].direction, Direction.DESC);
    });

    it('seeds value with descending sort for target string', function() {
      const result = Order.desc('/foo/bar');
      assert.lengthOf(result.value, 1);
      assert.deepEqual(result.value[0].target.path, ['foo', 'bar']);
    });

    it('seeds value with descending sort for Target', function() {
      const target = Target.parse('/foo/bar');
      const result = Order.desc(target);
      assert.lengthOf(result.value, 1);
      assert.strictEqual(result.value[0].target, target);
    });
  });


  describe('#asc', function() {
    it('throws if target not string or Target', function() {
      assert.throws(() => {
        Order.asc('/foo').asc(42);
      }, TypeError);
    });

    it('returns same instance of Order', function() {
      const order = Order.asc('/foo');
      const result = order.asc('/bar');
      assert.strictEqual(result, order);
    });

    it('adds value with ascending sort', function() {
      const result = Order.asc('/foo').asc('/bar');
      assert.lengthOf(result.value, 2);
      assert.strictEqual(result.value[1].direction, Direction.ASC);
    });

    it('adds value with ascending sort for target string', function() {
      const result = Order.asc('/foo/bar').asc('/baz');
      assert.lengthOf(result.value, 2);
      assert.deepEqual(result.value[1].target.path, ['baz']);
    });

    it('adds value with ascending sort for Target', function() {
      const target = Target.parse('/bar/baz');
      const result = Order.asc('/foo').asc(target);
      assert.lengthOf(result.value, 2);
      assert.strictEqual(result.value[1].target, target);
    });
  });


  describe('#desc', function() {
    it('throws if target not string or Target', function() {
      assert.throws(() => {
        Order.asc('/foo').asc(42);
      }, TypeError);
    });

    it('returns same instance of Order', function() {
      const order = Order.asc('/foo');
      const result = order.desc('/bar');
      assert.strictEqual(result, order);
    });

    it('adds value with descending sort', function() {
      const result = Order.asc('/foo').desc('/bar');
      assert.lengthOf(result.value, 2);
      assert.strictEqual(result.value[1].direction, Direction.DESC);
    });

    it('adds value with descending sort for target string', function() {
      const result = Order.asc('/foo/bar').desc('/baz');
      assert.lengthOf(result.value, 2);
      assert.deepEqual(result.value[1].target.path, ['baz']);
    });

    it('adds value with descending sort for Target', function() {
      const target = Target.parse('/bar/baz');
      const result = Order.asc('/foo').desc(target);
      assert.lengthOf(result.value, 2);
      assert.strictEqual(result.value[1].target, target);
    });
  });


  describe('#toJSON', function() {
    it('returns array', function() {
      const result = Order.asc('/foo/bar').toJSON();
      assert.isArray(result);
    });

    it('returns array with sort object', function() {
      const result = Order.desc('/foo/bar').toJSON();
      assert.lengthOf(result, 1);
      assert.isObject(result[0]);
    });

    it('returns array with sort object including target', function() {
      const target = Target.parse('/foo/bar');
      const result = Order.asc(target).toJSON();
      assert.lengthOf(result, 1);
      assert.strictEqual(result[0].target, target);
    });

    it('returns array with sort object including direction', function() {
      const result = Order.desc('/foo/bar').toJSON();
      assert.lengthOf(result, 1);
      assert.strictEqual(result[0].direction, Direction.DESC);
    });
  });
});
