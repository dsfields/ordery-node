'use strict';

const { assert } = require('chai');

const Direction = require('../../lib/direction');
const parse = require('../../lib/parse');
const ParserError = require('../../lib/parser-error');


describe('parse', function() {
  it('throws if expression not string', function() {
    assert.throws(() => {
      parse(42);
    }, TypeError);
  });

  it('parses field', function() {
    const { value } = parse('/foo');
    assert.deepEqual(value.value[0].target.path, ['foo']);
  });

  it('parses subfield', function() {
    const { value } = parse('/foo/bar');
    assert.deepEqual(value.value[0].target.path, ['foo', 'bar']);
  });

  it('defaults direction to asc with field', function() {
    const { value } = parse('/foo');
    assert.strictEqual(value.value[0].direction, Direction.ASC);
  });

  it('defaults direction to asc with subfield', function() {
    const { value } = parse('/foo/bar');
    assert.strictEqual(value.value[0].direction, Direction.ASC);
  });

  it('parses asc with field', function() {
    const { value } = parse('/foo:asc');
    assert.strictEqual(value.value[0].direction, Direction.ASC);
  });

  it('parses asc with subfield', function() {
    const { value } = parse('/foo/bar:asc');
    assert.strictEqual(value.value[0].direction, Direction.ASC);
  });

  it('parses desc with field', function() {
    const { value } = parse('/foo:desc');
    assert.strictEqual(value.value[0].direction, Direction.DESC);
  });

  it('parses desc with subfield', function() {
    const { value } = parse('/foo/bar:desc');
    assert.strictEqual(value.value[0].direction, Direction.DESC);
  });

  it('parses field on concat', function() {
    const { value } = parse('/foo/bar,/baz');
    assert.deepEqual(value.value[1].target.path, ['baz']);
  });

  it('parses subfield on concat', function() {
    const { value } = parse('/foo/bar,/baz/qux');
    assert.deepEqual(value.value[1].target.path, ['baz', 'qux']);
  });

  it('defaults direction to asc with field on concat', function() {
    const { value } = parse('/foo/bar,/baz');
    assert.deepEqual(value.value[1].direction, Direction.ASC);
  });

  it('defaults direction to asc with subfield on concat', function() {
    const { value } = parse('/foo/bar,/baz/qux');
    assert.deepEqual(value.value[1].direction, Direction.ASC);
  });

  it('parses asc with field on concat', function() {
    const { value } = parse('/foo/bar,/baz:asc');
    assert.deepEqual(value.value[1].direction, Direction.ASC);
  });

  it('parses asc with subfield on concat', function() {
    const { value } = parse('/foo/bar,/baz/qux:asc');
    assert.deepEqual(value.value[1].direction, Direction.ASC);
  });

  it('parses desc with field on concat', function() {
    const { value } = parse('/foo/bar,/baz:desc');
    assert.deepEqual(value.value[1].direction, Direction.DESC);
  });

  it('parses desc with subfield on concat', function() {
    const { value } = parse('/foo/bar,/baz/qux:desc');
    assert.deepEqual(value.value[1].direction, Direction.DESC);
  });

  it('parses complex scenario 1', function() {
    const result = parse('/foo/bar,/baz:desc,/qux:asc');
    assert.isNull(result.error);
  });

  it('errors if does not start with field indicator', function() {
    const { error } = parse('foo/bar:asc,/baz/qux:desc');
    assert.instanceOf(error, ParserError);
  });

  it('errors if multiple successive field indicators', function() {
    const { error } = parse('//foo/bar:asc,/baz/qux:desc');
    assert.instanceOf(error, ParserError);
  });

  it('errors if field indicator has no field name', function() {
    const { error } = parse('/');
    assert.instanceOf(error, ParserError);
  });

  it('errors if field indicator succeeded by :', function() {
    const { error } = parse('/:');
    assert.instanceOf(error, ParserError);
  });

  it('errors if field indicator succeeded by ,', function() {
    const { error } = parse('/,');
    assert.instanceOf(error, ParserError);
  });

  it('errors if : not succeeded by direction', function() {
    const { error } = parse('/foo:');
    assert.instanceOf(error, ParserError);
  });

  it('errors if direction invalid', function() {
    const { error } = parse('/foo:bar');
    assert.instanceOf(error, ParserError);
  });

  it('errors if does not start with field indicator on concat', function() {
    const { error } = parse('/foo:desc,bar');
    assert.instanceOf(error, ParserError);
  });

  it('errors if multiple successive field indicators on concat', function() {
    const { error } = parse('/foo:desc,//');
    assert.instanceOf(error, ParserError);
  });

  it('errors if field indicator has no field name on concat', function() {
    const { error } = parse('/foo:desc,/');
    assert.instanceOf(error, ParserError);
  });

  it('errors if field indicator succeeded by : on concat', function() {
    const { error } = parse('/foo:desc,/:');
    assert.instanceOf(error, ParserError);
  });

  it('errors if field indicator succeeded by , on concat', function() {
    const { error } = parse('/foo:desc,/,');
    assert.instanceOf(error, ParserError);
  });

  it('errors if : not succeeded by direction on concat', function() {
    const { error } = parse('/foo:desc,/bar:');
    assert.instanceOf(error, ParserError);
  });

  it('errors if direction invalid on concat', function() {
    const { error } = parse('/foo:desc,/bar:qux');
    assert.instanceOf(error, ParserError);
  });
});
