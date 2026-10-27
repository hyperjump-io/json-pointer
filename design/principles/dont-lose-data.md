# Don't lose data silently

A pointer only finds and makes what JSON can hold. Where JavaScript would
accept an operation whose result `JSON.stringify` drops, it's an error
instead.

- A segment applied to an array has to be an index or `-`. JavaScript
  allows `arr.foo = 1`, but `JSON.stringify` doesn't write `foo`, so
  `set("/foo", arr, 1)` throws. RFC 6901 calls it an error too (see
  [Pointers](../components/pointers.md#array-indexes)).
- Only own enumerable properties are found, the ones `JSON.stringify`
  writes. An array's `length` is an own property, but `/length` doesn't
  find it (see [Getting values](../components/getting-values.md)).

Holes in arrays aren't lost: `JSON.stringify` writes them as `null`.
