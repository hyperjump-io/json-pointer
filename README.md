# Hyperjump - JSON Pointer

An implementation of
[RFC 6901 JSON Pointer](https://www.rfc-editor.org/rfc/rfc6901). Get, set,
and remove values in a JSON document by pointer, and build and split
pointers without escaping them by hand.

**[Read the documentation at hyperjump.io](https://hyperjump.io/json-pointer/)**

```bash
npm install @hyperjump/json-pointer
```

```typescript
import { pointerGet, pointerSet } from "@hyperjump/json-pointer";

const doc = { foo: { bar: 42 } };

pointerGet("/foo/bar", doc); // 42

const updated = pointerSet("/foo/bar", doc, 33);
updated.foo.bar; // 33
doc.foo.bar; // 42
```

- **Immutable or in place.** `pointerSet` and `pointerUnset` return a new
  value and leave the original alone. `pointerAssign` and `pointerRemove`
  change it in place.
- **Parse once, apply many times.** Give a function only a pointer, and it
  returns a function you can apply to any number of documents.
- **Escaping handled.** `pointerAppend`, `pointerParse`, and
  `pointerStringify` escape and unescape `~` and `/` for you.
- **Small.** No dependencies. TypeScript types included. Works in Node.js
  and browsers.

## Documentation

- [Install](https://hyperjump.io/json-pointer/install/)
- [Pointers](https://hyperjump.io/json-pointer/pointers/)
- [Get values](https://hyperjump.io/json-pointer/get-values/)
- [Change values](https://hyperjump.io/json-pointer/change-values/)
- [Migrate from v1](https://hyperjump.io/json-pointer/migrate-from-v1/)

Using v1? See the [v1 README](https://github.com/hyperjump-io/json-pointer/tree/v1#readme).

## Contributing

### Tests

Run the tests

```bash
npm test
```

Run the tests with a continuous test runner

```bash
npm test -- --watch
```

Lint and type-check

```bash
npm run lint
npm run type-check
```

### Docs

The user documentation is in [`website/`](website/README.md), and it's
published to [hyperjump.io](https://hyperjump.io/json-pointer/). The design
docs, principles, and style guide are in [`design/`](design/README.md).
