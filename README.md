# ordery

The `ordery` module provides parsing for dynamic, ordery-by statements, and serves as a high-level abstraction for query ordering.  Parsed expressions can then be later turned into order by statements for different database technologies.  This is most useful for ingesting dynamic queries in a request to a RESTful API collection.

__Contents__
* [Usage](#usage)
* [Ordery Expressions](#ordery-expressions)
* [API](#api)
* [Plugins](#plugins)

## Usage

Add `ordery` to your `package.json` file's `dependencies`:

```sh
$ npm install ordery -S
```

Then use it in your code:

```js
const ordery = require('ordery');

const expr = '/foo/bar,/baz:desc,/qux:asc';
const result = ordery.parse(expr);

console.log(result.value);
// [
//   {
//     target: {
//       path: ['foo', 'bar'],
//       value: '/foo/bar'
//     },
//     direction: 'asc',
//   },
//   {
//     target: {
//       path: ['baz'],
//       value: '/baz'
//     },
//     direction: 'desc',
//   },
//   {
//     target: {
//       path: ['qux'],
//       value: '/qux'
//     },
//     direction: 'asc',
//   }
// ]
```

## Ordery Expressions

All expressions have the structure (in Extended Backus-Naur Form):

```ebnf
expression = clause , { "," , clause } ;
clause = json_pointer , [ ":" , direction ] ;
direction = "asc" | "desc" ;
json_pointer = field , { field } ;
field = "/" , field_char , { field_char } ;
field_char = alphanumeric | "_" ;
alphanumeric = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I"
             | "J" | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R"
             | "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z" | "a"
             | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j"
             | "k" | "l" | "m" | "n" | "o" | "p" | "q" | "r" | "s"
             | "t" | "u" | "v" | "w" | "x" | "y" | "z" | "0" | "1"
             | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" ;
```

### Examples

Order by target `/foo` ascending:

```
/foo
```

Order by target `/foo` ascending, and then by target `/bar/baz` descending.

```
/foo:asc,/bar/baz:desc
```

## API

The `ordery` module provides a simple interface for working with order-by expressions.

### `ordery.Direction`

A reference to the `Direction` enum value.  This enum includes the values:

* `ASC`: represents ascending order.

* `DESC`: represents descending order.

### `ordery.errors.ParserError`

A reference to the error throw by the [Ordery Expression](#order-expression) parser when an invalid expression is encountered.

### `ordery.parse(expression)`

Parses an [Ordery Expression](#order-expression).

__Parameters__

* `expression`: _(required)_ a string formatted as an Order Expression.

__Returns__

An object containing the result of the parsing operation.  This object has the following keys:

* `error`: if parsing failed, this key will contain the resulting [`ParserError`](#orderyerrorsparsererror).  If parsing succeeded, this key is `null`.

* `value`: instance of [`Order`](#orderyorder).

### `ordery.Order`

A class representing an Order Expression.

#### `Order.asc(target)`

A factory method for creating instances of `Order`.  This method seeds the resulting `Order` instance with an ascending order clause with the given `target`.

__Parameters__

* `target`: _(required)_ a string formatted as an [RFC 6901 JSON pointer](https://tools.ietf.org/html/rfc6901), or an instance of [`Target`](#orderytarget).

__Returns__

A new instance of `Order`.

#### `Order.desc(target)`

A factory method for creating instances of `Order`.  This method seeds the resulting `Order` instance with a descending order clause with the given `target`.

__Parameters__

* `target`: _(required)_ a string formatted as an [RFC 6901 JSON pointer](https://tools.ietf.org/html/rfc6901), or an instance of [`Target`](#orderytarget).

__Returns__

A new instance of `Order`.

#### `Order.prototype.value`

A property that gets an array containing objects that define an order-by clause.  Each object has the following keys:

* `direction`: a string indicating the sort direction of the order-by clause.  This can be either `asc` or `desc`.

* `target`: an instance of [`Target`](#orderytarget).

#### `Order.prototype.asc(target)`

A method that appends an ascending order clause to the `Order` instance using the given `target`.

__Parameters__

* `target`: _(required)_ a string formatted as an [RFC 6901 JSON pointer](https://tools.ietf.org/html/rfc6901), or an instance of [`Target`](#orderytarget).

__Returns__

The instance of `Order`.

#### `Order.prototype.desc(target)`

A method that appends a descending order clause to the `Order` instance using the given `target`.

__Parameters__

* `target`: _(required)_ a string formatted as an [RFC 6901 JSON pointer](https://tools.ietf.org/html/rfc6901), or an instance of [`Target`](#orderytarget).

__Returns__

The instance of `Order`.

### `ordery.Target`

A class that represents a field target in an order-by statement.

#### `Target.parse(target)`

A factory method that parses a string representing a field reference.

__Parameters__

* `target`: _(required)_ a string formatted as an [RFC 6901 JSON pointer](https://tools.ietf.org/html/rfc6901).

__Returns__

A new instance of `Target`.

#### `Target.prototype.path`

A property that gets an array of all field references in the target.  Each field reference is a string that represents the name of a key on a document or sub-document, or an integer that references an index in an array.

### `Target.prototype.value`

A property that gets a string that represents the original JSON pointer value.

## Plugins

The `ordery` module provides a high-level abstraction over the concern of sort instructions, and is suitable for communicating sort instructions across application layers.  At some point, `order.Order` instances need to be converted into a sort instruction usable by an database technology.

Available plugins for this purpose include:

* [`ordery-mongodb`](https://www.npmjs.com/package/ordery-mongodb)
