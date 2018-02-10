# ordery

The `ordery` module provides parsing for dynamic, ordery-by expressions, and serves as a high-level abstraction for query ordering.  Parsed expressions can then be later turned into order by statements for different database technologies.  This is most useful for ingesting dynamic queries in a request to a RESTful API collection.

__Contents__
* [Usage](#usage)
* [Ordery Expressions](#ordery-expressions)
* [API](#api)

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

console.log(result);
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
