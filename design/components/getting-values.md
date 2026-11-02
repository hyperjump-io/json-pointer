# Getting values (`pointerGet`)

`pointerGet(pointer, subject)` returns the value the pointer identifies,
not a copy.

- If the last segment names a property or item that isn't there, it
  returns `undefined`. A JSON value is never `undefined`, so it can't be
  mistaken for one.
- If a segment before the last doesn't lead to an object or an array, it
  throws, saying where it stopped (see [Errors](errors.md)).
- Only own properties are found. `/toString` doesn't find a method.
  `/length` on an array throws, because `length` isn't an index (see
  [Don't lose data silently](../principles/dont-lose-data.md)).
- `-` on an array is never there, so it returns `undefined`.
- A string isn't a container, even though `"abc"[0]` works in JavaScript.
  JSON has no way to point into a string.

## Rejected

- **Only own enumerable properties**, the ones `JSON.stringify` writes.
  Checking enumerability with `propertyIsEnumerable` made `pointerGet` and
  `pointerSet` 1.3–1.4 times slower than v1, and `Object.hasOwn` gives
  the same answer for every value `JSON.parse` makes. They differ only for
  a property made non-enumerable with `Object.defineProperty`, which isn't
  JSON, and for an array's `length`, which throws anyway because it isn't
  an index (see [Comparison with v1](../benchmarks/v1-comparison.md)).

- **`has(pointer, subject)`.** Following JavaScript, it would throw when a
  parent is missing, like `"x" in a.b` does. Then it's only
  `pointerGet(pointer, subject) !== undefined`, since no JSON value is
  `undefined`. One that never throws would be unlike everything else here.
