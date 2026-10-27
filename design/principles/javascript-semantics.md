# Do what JavaScript does

An operation by pointer does what the same operation written in JavaScript
does to a value that came from `JSON.parse`. `set("/a/0", doc, 1)` is
`doc.a[0] = 1`, without changing `doc`. Someone who knows JavaScript can
predict what happens without reading the docs.

- Removing an array item leaves a hole, like `delete arr[0]`. It doesn't
  splice, so the indexes of the other items don't change (see
  [Changing values](../components/changing-values.md#arrays)).
- Setting an index past the end of an array leaves holes before it, like
  `arr[5] = 1`.
- Array indexes are what JavaScript treats as indexes. `arr["01"]` is
  `undefined` in JavaScript, so `/01` isn't item 1. v1 used `parseInt` and
  got this wrong (see [Pointers](../components/pointers.md#array-indexes)).
- `__proto__` is an ordinary property name, because `JSON.parse` makes it
  one. `obj["__proto__"] = v` changes the prototype instead, but that's
  not what it does to JSON.

The exception is where JavaScript would lose data silently (see
[Don't lose data silently](dont-lose-data.md)).

## Rejected

- **JSON Patch semantics** (removing splices, setting past the end
  throws). It's what RFC 6902 does, but it's not what JavaScript does, and
  this isn't a JSON Patch implementation.
