'use strict';

const { assert } = require('chai');

const Lexer = require('../../lib/lexer');
const ParserError = require('../../lib/parser-error');
const Token = require('../../lib/token');


describe('Lexer', function() {
  describe('.constructor', function() {
    it('throws if value not string', function() {
      assert.throws(() => {
        const result = new Lexer(42);
        assert.isNotOk(result);
      }, TypeError);
    });

    it('throws if value empty string', function() {
      assert.throws(() => {
        const result = new Lexer('');
        assert.isNotOk(result);
      }, TypeError);
    });

    it('sets current token to none', function() {
      const result = new Lexer('/foo');
      assert.strictEqual(result.current.token, Token.NONE);
    });

    it('sets current terminator to none', function() {
      const result = new Lexer('/foo');
      assert.strictEqual(result.current.terminator, Token.NONE);
    });

    it('sets current value to empty string', function() {
      const result = new Lexer('/foo');
      assert.strictEqual(result.current.value, '');
    });
  });


  describe('#throw', function() {
    it('throws ParserError', function() {
      const lexer = new Lexer('/foo');

      assert.throws(() => {
        lexer.throw();
      }, ParserError);
    });

    it('appends provided message', function() {
      const msg = 'Watch it bring you to your sha na na na na knees knees';

      try {
        const result = new Lexer('/foo');
        result.throw(msg);
      } catch (err) {
        assert.isTrue(err.message.endsWith(msg));
      }
    });
  });


  describe('#next', function() {
    it('returns true when there is more to parse', function() {
      const lexer = new Lexer('/foo');
      const result = lexer.next();
      assert.isTrue(result);
    });

    it('returns false when there is no more to parse', function() {
      const lexer = new Lexer('/foo');
      lexer.next();
      lexer.next();
      const result = lexer.next();
      assert.isFalse(result);
    });

    it('parses /', function() {
      const lexer = new Lexer('/');
      lexer.next();
      assert.strictEqual(lexer.current.token, Token.FIELD_INDICATOR);
      assert.strictEqual(lexer.current.terminator, Token.FIELD_INDICATOR);
      assert.strictEqual(lexer.current.value, '/');
    });

    it('parses :', function() {
      const lexer = new Lexer(':');
      lexer.next();
      assert.strictEqual(lexer.current.token, Token.DIR_INDICATOR);
      assert.strictEqual(lexer.current.terminator, Token.DIR_INDICATOR);
      assert.strictEqual(lexer.current.value, ':');
    });

    it('parses ,', function() {
      const lexer = new Lexer(',');
      lexer.next();
      assert.strictEqual(lexer.current.token, Token.CONCAT);
      assert.strictEqual(lexer.current.terminator, Token.CONCAT);
      assert.strictEqual(lexer.current.value, ',');
    });

    it('parses field after /', function() {
      const lexer = new Lexer('/foo');
      lexer.next();
      lexer.next();
      assert.strictEqual(lexer.current.token, Token.FIELD);
      assert.strictEqual(lexer.current.value, 'foo');
    });

    it('parses multipart field after /', function() {
      const lexer = new Lexer('/foo/bar');
      lexer.next();
      lexer.next();
      assert.strictEqual(lexer.current.token, Token.FIELD);
      assert.strictEqual(lexer.current.value, 'foo');
    });

    it('parses downstream multipart field after second /', function() {
      const lexer = new Lexer('/foo/bar');
      lexer.next();
      lexer.next();
      lexer.next();
      lexer.next();
      assert.strictEqual(lexer.current.token, Token.FIELD);
      assert.strictEqual(lexer.current.value, 'bar');
    });

    it('parses int field', function() {
      const lexer = new Lexer('/42');
      lexer.next();
      lexer.next();
      assert.strictEqual(lexer.current.token, Token.FIELD);
      assert.strictEqual(lexer.current.value, 42);
    });

    it('parses int parent field', function() {
      const lexer = new Lexer('/4273/bar');
      lexer.next();
      lexer.next();
      assert.strictEqual(lexer.current.token, Token.FIELD);
      assert.strictEqual(lexer.current.value, 4273);
    });

    it('parses int subfield', function() {
      const lexer = new Lexer('/foo/7');
      lexer.next();
      lexer.next();
      lexer.next();
      lexer.next();
      assert.strictEqual(lexer.current.token, Token.FIELD);
      assert.strictEqual(lexer.current.value, 7);
    });

    it('parses int fields', function() {
      const lexer = new Lexer('/42/7');
      lexer.next();
      lexer.next();
      assert.strictEqual(lexer.current.token, Token.FIELD);
      assert.strictEqual(lexer.current.value, 42);
      lexer.next();
      lexer.next();
      assert.strictEqual(lexer.current.token, Token.FIELD);
      assert.strictEqual(lexer.current.value, 7);
    });

    it('parses int terminated with :', function() {
      const lexer = new Lexer('/foo/7:desc');
      lexer.next();
      lexer.next();
      lexer.next();
      lexer.next();
      assert.strictEqual(lexer.current.token, Token.FIELD);
      assert.strictEqual(lexer.current.value, 7);
    });

    it('parses asc direction after :', function() {
      const lexer = new Lexer(':asc');
      lexer.next();
      lexer.next();
      assert.strictEqual(lexer.current.token, Token.DIRECTION);
      assert.strictEqual(lexer.current.value, 'asc');
    });

    it('parses desc direction after :', function() {
      const lexer = new Lexer(':desc');
      lexer.next();
      lexer.next();
      assert.strictEqual(lexer.current.token, Token.DIRECTION);
      assert.strictEqual(lexer.current.value, 'desc');
    });

    it('throws if invalid direction after :', function() {
      const lexer = new Lexer(':bork');
      lexer.next();

      assert.throws(() => {
        lexer.next();
      }, ParserError);
    });

    it('parses / after /', function() {
      const lexer = new Lexer('//');
      lexer.next();
      lexer.next();
      assert.strictEqual(lexer.current.token, Token.FIELD_INDICATOR);
      assert.strictEqual(lexer.current.value, '/');
    });

    it('parses : after /', function() {
      const lexer = new Lexer('/:');
      lexer.next();
      lexer.next();
      assert.strictEqual(lexer.current.token, Token.DIR_INDICATOR);
      assert.strictEqual(lexer.current.value, ':');
    });

    it('parses , after /', function() {
      const lexer = new Lexer('/,');
      lexer.next();
      lexer.next();
      assert.strictEqual(lexer.current.token, Token.CONCAT);
      assert.strictEqual(lexer.current.value, ',');
    });

    it('parses / after :', function() {
      const lexer = new Lexer(':/');
      lexer.next();
      lexer.next();
      assert.strictEqual(lexer.current.token, Token.FIELD_INDICATOR);
      assert.strictEqual(lexer.current.value, '/');
    });

    it('parses : after :', function() {
      const lexer = new Lexer('::');
      lexer.next();
      lexer.next();
      assert.strictEqual(lexer.current.token, Token.DIR_INDICATOR);
      assert.strictEqual(lexer.current.value, ':');
    });

    it('parses , after :', function() {
      const lexer = new Lexer(':,');
      lexer.next();
      lexer.next();
      assert.strictEqual(lexer.current.token, Token.CONCAT);
      assert.strictEqual(lexer.current.value, ',');
    });

    it('parses / after ,', function() {
      const lexer = new Lexer(',/');
      lexer.next();
      lexer.next();
      assert.strictEqual(lexer.current.token, Token.FIELD_INDICATOR);
      assert.strictEqual(lexer.current.value, '/');
    });

    it('parses : after ,', function() {
      const lexer = new Lexer(',:');
      lexer.next();
      lexer.next();
      assert.strictEqual(lexer.current.token, Token.DIR_INDICATOR);
      assert.strictEqual(lexer.current.value, ':');
    });

    it('parses , after ,', function() {
      const lexer = new Lexer(',,');
      lexer.next();
      lexer.next();
      assert.strictEqual(lexer.current.token, Token.CONCAT);
      assert.strictEqual(lexer.current.value, ',');
    });

    it('parses unknown', function() {
      const lexer = new Lexer('rofl');
      lexer.next();
      assert.strictEqual(lexer.current.token, Token.UNKNOWN);
      assert.strictEqual(lexer.current.value, 'rofl');
    });

    it('parses unknown after ,', function() {
      const lexer = new Lexer(',rofl');
      lexer.next();
      lexer.next();
      assert.strictEqual(lexer.current.token, Token.UNKNOWN);
      assert.strictEqual(lexer.current.value, 'rofl');
    });

    it('parses unknown terminated by /', function() {
      const lexer = new Lexer('rofl/');
      lexer.next();
      assert.strictEqual(lexer.current.token, Token.UNKNOWN);
      assert.strictEqual(lexer.current.value, 'rofl');
    });

    it('parses unknown terminated by :', function() {
      const lexer = new Lexer('rofl:');
      lexer.next();
      assert.strictEqual(lexer.current.token, Token.UNKNOWN);
      assert.strictEqual(lexer.current.value, 'rofl');
    });

    it('parses unknown terminated by ,', function() {
      const lexer = new Lexer('rofl,');
      lexer.next();
      assert.strictEqual(lexer.current.token, Token.UNKNOWN);
      assert.strictEqual(lexer.current.value, 'rofl');
    });

    it('parses unknown after ,', function() {
      const lexer = new Lexer(',rofl');
      lexer.next();
      lexer.next();
      assert.strictEqual(lexer.current.token, Token.UNKNOWN);
      assert.strictEqual(lexer.current.value, 'rofl');
    });

    it('parses unknown after ,', function() {
      const lexer = new Lexer(',rofl');
      lexer.next();
      lexer.next();
      assert.strictEqual(lexer.current.token, Token.UNKNOWN);
      assert.strictEqual(lexer.current.value, 'rofl');
    });

    it('parses unknown after , terminated by /', function() {
      const lexer = new Lexer(',rofl/');
      lexer.next();
      lexer.next();
      assert.strictEqual(lexer.current.token, Token.UNKNOWN);
      assert.strictEqual(lexer.current.value, 'rofl');
    });

    it('parses unknown after , terminated by :', function() {
      const lexer = new Lexer(',rofl:');
      lexer.next();
      lexer.next();
      assert.strictEqual(lexer.current.token, Token.UNKNOWN);
      assert.strictEqual(lexer.current.value, 'rofl');
    });

    it('parses unknown after , terminated by ,', function() {
      const lexer = new Lexer(',rofl,');
      lexer.next();
      lexer.next();
      assert.strictEqual(lexer.current.token, Token.UNKNOWN);
      assert.strictEqual(lexer.current.value, 'rofl');
    });

    it('parses downstream /', function() {
      const lexer = new Lexer('/foo/bar');
      lexer.next();
      lexer.next();
      lexer.next();
      assert.strictEqual(lexer.current.token, Token.FIELD_INDICATOR);
      assert.strictEqual(lexer.current.value, '/');
    });

    it('parses downstream ,', function() {
      const lexer = new Lexer('/foo,');
      lexer.next();
      lexer.next();
      lexer.next();
      assert.strictEqual(lexer.current.token, Token.CONCAT);
      assert.strictEqual(lexer.current.value, ',');
    });

    it('parses downstream :', function() {
      const lexer = new Lexer('/foo:desc');
      lexer.next();
      lexer.next();
      lexer.next();
      assert.strictEqual(lexer.current.token, Token.DIR_INDICATOR);
      assert.strictEqual(lexer.current.value, ':');
    });

    it('parses downstream asc direction', function() {
      const lexer = new Lexer('/foo:asc,/bar');
      lexer.next();
      lexer.next();
      lexer.next();
      lexer.next();
      assert.strictEqual(lexer.current.token, Token.DIRECTION);
      assert.strictEqual(lexer.current.value, 'asc');
    });

    it('parses downstream desc direction', function() {
      const lexer = new Lexer('/foo:desc,/bar');
      lexer.next();
      lexer.next();
      lexer.next();
      lexer.next();
      assert.strictEqual(lexer.current.token, Token.DIRECTION);
      assert.strictEqual(lexer.current.value, 'desc');
    });

    //
    // FULL USE CASES
    //

    it('/', function() {
      const lexer = new Lexer('/');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.FIELD_INDICATOR);
      assert.strictEqual(lexer.current.value, '/');
      assert.isFalse(lexer.next());
    });

    it('parses /foo', function() {
      const lexer = new Lexer('/foo');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.FIELD_INDICATOR);
      assert.strictEqual(lexer.current.value, '/');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.FIELD);
      assert.strictEqual(lexer.current.value, 'foo');
      assert.isFalse(lexer.next());
    });

    it('parses /foo/bar', function() {
      const lexer = new Lexer('/foo/bar');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.FIELD_INDICATOR);
      assert.strictEqual(lexer.current.value, '/');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.FIELD);
      assert.strictEqual(lexer.current.value, 'foo');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.FIELD_INDICATOR);
      assert.strictEqual(lexer.current.value, '/');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.FIELD);
      assert.strictEqual(lexer.current.value, 'bar');
      assert.isFalse(lexer.next());
    });

    it('parses /foo/bar:asc', function() {
      const lexer = new Lexer('/foo/bar:asc');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.FIELD_INDICATOR);
      assert.strictEqual(lexer.current.value, '/');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.FIELD);
      assert.strictEqual(lexer.current.value, 'foo');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.FIELD_INDICATOR);
      assert.strictEqual(lexer.current.value, '/');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.FIELD);
      assert.strictEqual(lexer.current.value, 'bar');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.DIR_INDICATOR);
      assert.strictEqual(lexer.current.value, ':');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.DIRECTION);
      assert.strictEqual(lexer.current.value, 'asc');
      assert.isFalse(lexer.next());
    });

    it('parses /foo/bar:asc,/baz', function() {
      const lexer = new Lexer('/foo/bar:asc,/baz');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.FIELD_INDICATOR);
      assert.strictEqual(lexer.current.value, '/');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.FIELD);
      assert.strictEqual(lexer.current.value, 'foo');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.FIELD_INDICATOR);
      assert.strictEqual(lexer.current.value, '/');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.FIELD);
      assert.strictEqual(lexer.current.value, 'bar');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.DIR_INDICATOR);
      assert.strictEqual(lexer.current.value, ':');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.DIRECTION);
      assert.strictEqual(lexer.current.value, 'asc');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.CONCAT);
      assert.strictEqual(lexer.current.value, ',');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.FIELD_INDICATOR);
      assert.strictEqual(lexer.current.value, '/');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.FIELD);
      assert.strictEqual(lexer.current.value, 'baz');
      assert.isFalse(lexer.next());
    });

    it('parses /foo/bar:asc,/baz:desc', function() {
      const lexer = new Lexer('/foo/bar:asc,/baz:desc');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.FIELD_INDICATOR);
      assert.strictEqual(lexer.current.value, '/');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.FIELD);
      assert.strictEqual(lexer.current.value, 'foo');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.FIELD_INDICATOR);
      assert.strictEqual(lexer.current.value, '/');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.FIELD);
      assert.strictEqual(lexer.current.value, 'bar');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.DIR_INDICATOR);
      assert.strictEqual(lexer.current.value, ':');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.DIRECTION);
      assert.strictEqual(lexer.current.value, 'asc');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.CONCAT);
      assert.strictEqual(lexer.current.value, ',');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.FIELD_INDICATOR);
      assert.strictEqual(lexer.current.value, '/');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.FIELD);
      assert.strictEqual(lexer.current.value, 'baz');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.DIR_INDICATOR);
      assert.strictEqual(lexer.current.value, ':');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.DIRECTION);
      assert.strictEqual(lexer.current.value, 'desc');
      assert.isFalse(lexer.next());
    });

    it('parses /foo/bar:asc,/baz:desc,/qux', function() {
      const lexer = new Lexer('/foo/bar:asc,/baz:desc,/qux');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.FIELD_INDICATOR);
      assert.strictEqual(lexer.current.value, '/');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.FIELD);
      assert.strictEqual(lexer.current.value, 'foo');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.FIELD_INDICATOR);
      assert.strictEqual(lexer.current.value, '/');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.FIELD);
      assert.strictEqual(lexer.current.value, 'bar');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.DIR_INDICATOR);
      assert.strictEqual(lexer.current.value, ':');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.DIRECTION);
      assert.strictEqual(lexer.current.value, 'asc');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.CONCAT);
      assert.strictEqual(lexer.current.value, ',');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.FIELD_INDICATOR);
      assert.strictEqual(lexer.current.value, '/');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.FIELD);
      assert.strictEqual(lexer.current.value, 'baz');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.DIR_INDICATOR);
      assert.strictEqual(lexer.current.value, ':');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.DIRECTION);
      assert.strictEqual(lexer.current.value, 'desc');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.CONCAT);
      assert.strictEqual(lexer.current.value, ',');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.FIELD_INDICATOR);
      assert.strictEqual(lexer.current.value, '/');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.FIELD);
      assert.strictEqual(lexer.current.value, 'qux');
      assert.isFalse(lexer.next());
    });

    it('parses /foo/bar:asc,/baz:desc,/qux,/quux', function() {
      const lexer = new Lexer('/foo/bar:asc,/baz:desc,/qux,/quux');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.FIELD_INDICATOR);
      assert.strictEqual(lexer.current.value, '/');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.FIELD);
      assert.strictEqual(lexer.current.value, 'foo');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.FIELD_INDICATOR);
      assert.strictEqual(lexer.current.value, '/');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.FIELD);
      assert.strictEqual(lexer.current.value, 'bar');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.DIR_INDICATOR);
      assert.strictEqual(lexer.current.value, ':');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.DIRECTION);
      assert.strictEqual(lexer.current.value, 'asc');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.CONCAT);
      assert.strictEqual(lexer.current.value, ',');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.FIELD_INDICATOR);
      assert.strictEqual(lexer.current.value, '/');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.FIELD);
      assert.strictEqual(lexer.current.value, 'baz');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.DIR_INDICATOR);
      assert.strictEqual(lexer.current.value, ':');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.DIRECTION);
      assert.strictEqual(lexer.current.value, 'desc');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.CONCAT);
      assert.strictEqual(lexer.current.value, ',');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.FIELD_INDICATOR);
      assert.strictEqual(lexer.current.value, '/');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.FIELD);
      assert.strictEqual(lexer.current.value, 'qux');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.CONCAT);
      assert.strictEqual(lexer.current.value, ',');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.FIELD_INDICATOR);
      assert.strictEqual(lexer.current.value, '/');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.FIELD);
      assert.strictEqual(lexer.current.value, 'quux');
      assert.isFalse(lexer.next());
    });

    it('parses /foo/bar:asc,/baz:desc,/qux,/quux:desc', function() {
      const lexer = new Lexer('/foo/bar:asc,/baz:desc,/qux,/quux:desc');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.FIELD_INDICATOR);
      assert.strictEqual(lexer.current.value, '/');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.FIELD);
      assert.strictEqual(lexer.current.value, 'foo');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.FIELD_INDICATOR);
      assert.strictEqual(lexer.current.value, '/');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.FIELD);
      assert.strictEqual(lexer.current.value, 'bar');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.DIR_INDICATOR);
      assert.strictEqual(lexer.current.value, ':');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.DIRECTION);
      assert.strictEqual(lexer.current.value, 'asc');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.CONCAT);
      assert.strictEqual(lexer.current.value, ',');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.FIELD_INDICATOR);
      assert.strictEqual(lexer.current.value, '/');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.FIELD);
      assert.strictEqual(lexer.current.value, 'baz');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.DIR_INDICATOR);
      assert.strictEqual(lexer.current.value, ':');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.DIRECTION);
      assert.strictEqual(lexer.current.value, 'desc');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.CONCAT);
      assert.strictEqual(lexer.current.value, ',');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.FIELD_INDICATOR);
      assert.strictEqual(lexer.current.value, '/');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.FIELD);
      assert.strictEqual(lexer.current.value, 'qux');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.CONCAT);
      assert.strictEqual(lexer.current.value, ',');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.FIELD_INDICATOR);
      assert.strictEqual(lexer.current.value, '/');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.FIELD);
      assert.strictEqual(lexer.current.value, 'quux');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.DIR_INDICATOR);
      assert.strictEqual(lexer.current.value, ':');
      assert.isTrue(lexer.next());
      assert.strictEqual(lexer.current.token, Token.DIRECTION);
      assert.strictEqual(lexer.current.value, 'desc');
      assert.isFalse(lexer.next());
    });
  });
});
