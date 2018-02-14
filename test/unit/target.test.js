'use strict';

const { assert } = require('chai');

const Lexer = require('../../lib/lexer');
const ParserError = require('../../lib/parser-error');
const Target = require('../../lib/target');


describe('Target', function() {
  describe('#path', function() {
    it('returns an array of field target paths', function() {
      const path = ['foo', 'bar'];
      const target = new Target(path);
      assert.isArray(target.path);
    });

    it('contains path', function() {
      const path = ['foo', 'bar'];
      const target = new Target(path);
      assert.deepEqual(target.path, path);
    });
  });


  describe('#value', function() {
    it('returns string', function() {
      const path = ['foo', 'bar'];
      const target = new Target(path);
      assert.isString(target.value);
    });

    it('returns JSON pointer if built by constructor', function() {
      const path = ['foo', 'bar'];
      const target = new Target(path);
      assert.strictEqual(target.value, '/foo/bar');
    });

    it('returns JSON pointer if provided by constructor', function() {
      const path = ['foo', 'bar'];
      const value = '/foo/bar';
      const target = new Target(path, value);
      assert.strictEqual(target.value, value);
    });
  });


  describe('#toJSON', function() {
    it('returns object', function() {
      const target = new Target(['foo']);
      const result = target.toJSON();
      assert.isObject(result);
    });

    it('returns object with path', function() {
      const target = new Target(['foo']);
      const result = target.toJSON();
      assert.deepEqual(result.path, target.path);
    });

    it('returns object with value', function() {
      const target = new Target(['foo']);
      const result = target.toJSON();
      assert.deepEqual(result.value, target.value);
    });
  });


  describe('.parse', function() {
    it('return Target if given Target', function() {
      const target = new Target(['foo', 'bar']);
      const result = Target.parse(target);
      assert.strictEqual(result, target);
    });

    it('throws if target not string or Target', function() {
      assert.throws(() => {
        Target.parse(42);
      }, TypeError);
    });

    it('throws if empty', function() {
      assert.throws(() => {
        Target.parse('');
      }, TypeError);
    });

    it('throws if no field', function() {
      assert.throws(() => {
        Target.parse('/');
      }, ParserError);
    });

    it('throws if no field indicator', function() {
      assert.throws(() => {
        Target.parse('foo');
      }, ParserError);
    });

    it('throws if no downstream field', function() {
      assert.throws(() => {
        Target.parse('/foo/');
      }, ParserError);
    });

    it('throws if double field indicator', function() {
      assert.throws(() => {
        Target.parse('//');
      }, ParserError);
    });

    it('throws if / succeeded by :', function() {
      assert.throws(() => {
        Target.parse('/:');
      }, ParserError);
    });

    it('throws if / succeeded by ,', function() {
      assert.throws(() => {
        Target.parse('/,');
      }, ParserError);
    });

    it('throws if field succeeded by :', function() {
      assert.throws(() => {
        Target.parse('/foo:');
      }, ParserError);
    });

    it('throws if field succeeded by ,', function() {
      assert.throws(() => {
        Target.parse('/foo,');
      }, ParserError);
    });

    it('parses field', function() {
      const result = Target.parse('/foo');
      assert.deepEqual(result.path, ['foo']);
    });

    it('parses two subfield', function() {
      const result = Target.parse('/foo/bar');
      assert.deepEqual(result.path, ['foo', 'bar']);
    });

    it('parses integer', function() {
      const result = Target.parse('/42');
      assert.deepEqual(result.path, [42]);
    });

    it('parses downstream integer', function() {
      const result = Target.parse('/foo/42');
      assert.deepEqual(result.path, ['foo', 42]);
    });

    it('parses multiple integers', function() {
      const result = Target.parse('/1/42');
      assert.deepEqual(result.path, [1, 42]);
    });

    it('parses field with Lexer', function() {
      const lexer = new Lexer('/foo');
      lexer.next();
      const result = Target.parse(lexer);
      assert.deepEqual(result.path, ['foo']);
    });

    it('parses two subfield with Lexer', function() {
      const lexer = new Lexer('/foo/bar');
      lexer.next();
      const result = Target.parse(lexer);
      assert.deepEqual(result.path, ['foo', 'bar']);
    });

    it('parses integer with Lexer', function() {
      const lexer = new Lexer('/4');
      lexer.next();
      const result = Target.parse(lexer);
      assert.deepEqual(result.path, [4]);
    });

    it('parses downstream integer with Lexer', function() {
      const lexer = new Lexer('/foo/7');
      lexer.next();
      const result = Target.parse(lexer);
      assert.deepEqual(result.path, ['foo', 7]);
    });

    it('parses multiple integers with Lexer', function() {
      const lexer = new Lexer('/42/6');
      lexer.next();
      const result = Target.parse(lexer);
      assert.deepEqual(result.path, [42, 6]);
    });

    it('parses field terminated with , with Lexer', function() {
      const lexer = new Lexer('/foo,');
      lexer.next();
      const result = Target.parse(lexer);
      assert.deepEqual(result.path, ['foo']);
    });

    it('parses two subfield terminated with , with Lexer', function() {
      const lexer = new Lexer('/foo/bar,');
      lexer.next();
      const result = Target.parse(lexer);
      assert.deepEqual(result.path, ['foo', 'bar']);
    });

    it('parses integer field terminated with , with Lexer', function() {
      const lexer = new Lexer('/1,');
      lexer.next();
      const result = Target.parse(lexer);
      assert.deepEqual(result.path, [1]);
    });

    it('parses downstream integer terminated with , with Lexer', function() {
      const lexer = new Lexer('/foo/42,');
      lexer.next();
      const result = Target.parse(lexer);
      assert.deepEqual(result.path, ['foo', 42]);
    });

    it('parses multiple integer terminated with , with Lexer', function() {
      const lexer = new Lexer('/3/5678,');
      lexer.next();
      const result = Target.parse(lexer);
      assert.deepEqual(result.path, [3, 5678]);
    });

    it('parses field terminated with : with Lexer', function() {
      const lexer = new Lexer('/foo:');
      lexer.next();
      const result = Target.parse(lexer);
      assert.deepEqual(result.path, ['foo']);
    });

    it('parses two subfield terminated with : with Lexer', function() {
      const lexer = new Lexer('/foo/bar:');
      lexer.next();
      const result = Target.parse(lexer);
      assert.deepEqual(result.path, ['foo', 'bar']);
    });

    it('parses integer field terminated with : with Lexer', function() {
      const lexer = new Lexer('/42:');
      lexer.next();
      const result = Target.parse(lexer);
      assert.deepEqual(result.path, [42]);
    });

    it('parses downstream integer terminated with : with Lexer', function() {
      const lexer = new Lexer('/foo/42:');
      lexer.next();
      const result = Target.parse(lexer);
      assert.deepEqual(result.path, ['foo', 42]);
    });

    it('parses multiple integer terminated with : with Lexer', function() {
      const lexer = new Lexer('/1/2:');
      lexer.next();
      const result = Target.parse(lexer);
      assert.deepEqual(result.path, [1, 2]);
    });
  });
});
