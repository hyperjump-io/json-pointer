# JSON Pointer

An implementation of
[RFC 6901 JSON Pointer](https://www.rfc-editor.org/rfc/rfc6901). A JSON
Pointer is a string like `/foo/0/bar` that identifies one value in a JSON
document. This package gets, sets, and removes values by pointer. It also
builds and splits pointers, so you never have to escape them by hand.

The following example gets a value, and then sets a new one:

```typescript
import * as JsonPointer from "@hyperjump/json-pointer";

const doc = { foo: { bar: 42 } };

JsonPointer.get("/foo/bar", doc); // 42

const updated = JsonPointer.set("/foo/bar", doc, 33);
updated.foo.bar; // 33
doc.foo.bar; // 42
```

The package offers the following:

- **Immutable or in place.** `set` and `unset` return a new value and leave
  the original alone. `assign` and `remove` change it in place.
- **Parse once, apply many times.** Give a function only a pointer, and it
  returns a function that you can apply to any number of documents.
- **Escaping handled.** `append`, `parse`, and `stringify` escape and
  unescape `~` and `/` for you. Every function accepts segments as well as
  pointers.
- **Small.** No dependencies. It has TypeScript types and works in Node.js
  and browsers.

[`@hyperjump/json-schema`](https://github.com/hyperjump-io/json-schema/blob/v2/website/README.md)
and
[`@hyperjump/browser`](https://github.com/hyperjump-io/browser/blob/v2/website/README.md)
build on it.

If you use version 1.x, see the
[1.x README](https://github.com/hyperjump-io/json-pointer/tree/v1#readme).
For what changed in v2, see [Migrate from v1](migrate-from-v1.md).

## Contents

- [Install](install.md): setup for Node.js, browsers, and TypeScript
- [Pointers](pointers.md): how to write and build pointers, and pointers in
  URIs
- [Get values](get-values.md): `get`, and what it returns when a value
  isn't there
- [Change values](change-values.md): `set`, `assign`, `unset`, and
  `remove`
- [Migrate from v1](migrate-from-v1.md): what changed, and what to do
  about it
