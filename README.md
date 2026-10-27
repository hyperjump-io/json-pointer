# JSON Pointer

This is an implementation of RFC-6901 JSON Pointer. JSON Pointer is designed for
referring to data values within a JSON document. It's designed to be URL
friendly so it can be used as a URL fragment that points to a specific part of
the JSON document.

## Installation

Includes support for node.js (ES Modules, TypeScript) and browsers.

```bash
npm install @hyperjump/json-pointer
```

## Documentation

The documentation is in [`website/`](website/README.md). Start with
[Getting values](website/getting-values.md) and
[Changing values](website/changing-values.md).

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
