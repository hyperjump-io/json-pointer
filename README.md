# Hyperjump - JSON Pointer

An implementation of
[RFC 6901 JSON Pointer](https://www.rfc-editor.org/rfc/rfc6901). Get, set,
and remove values in a JSON document by pointer, and build and split
pointers without escaping them by hand.

**Status:** A from-scratch rewrite for v2, in progress and unpublished. See
[the design docs](design/README.md) for the decisions made so far.

## Install

```bash
npm install @hyperjump/json-pointer
```

## Documentation

The documentation is in [`website/`](website/README.md). Start with
[Get values](website/get-values.md) and
[Change values](website/change-values.md).

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

The design docs, principles, and style guide are in
[`design/`](design/README.md).
