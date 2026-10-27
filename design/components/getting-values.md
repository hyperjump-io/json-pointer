# Getting values (`get`)

`get(pointer, subject)` returns the value the pointer identifies, not a
copy.

- If the last segment names a property or item that isn't there, it
  returns `undefined`. A JSON value is never `undefined`, so it can't be
  mistaken for one.
- If a segment before the last doesn't lead to an object or an array, it
  throws, saying where it stopped (see [Errors](errors.md)).
- Only own enumerable properties are found, the ones `JSON.stringify`
  writes. `/toString` doesn't find a method, and `/length` doesn't find an
  array's length (see
  [Don't lose data silently](../principles/dont-lose-data.md)).
- `-` on an array is never there, so it returns `undefined`.
- A string isn't a container, even though `"abc"[0]` works in JavaScript.
  JSON has no way to point into a string.

## Open questions

- **`has(pointer, subject)`.** `get` returning `undefined` already says a
  value isn't there, but `has` doesn't throw when a parent is missing.
