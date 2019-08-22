JSON Pointer
============

This is an implementation of RFC-6901 JSON Pointer. JSON Pointer is designed for
referring to data values within a JSON document. It's designed to be URL
friendly so it can be used as a URL fragment that points to a specific part of
the JSON document.

Installation
------------

```bash
npm install @hyperjump/json-pointer
```

Usage
-----

```javascript
const JsonPointer = require("@hyperjump/json-pointer");

const value = {
  "foo": {
    "bar": 42
  }
};

// Construct pointers
const fooPointer = JsonPointer.append(JsonPointer.nil, "foo"); // "/foo"
const fooBarPointer = JsonPointer.append(fooPointer, "bar"); // "/foo/bar"

// Get value from pointer
const getFooBar = JsonPointer.get(fooBarPointer);
getFooBar(value); // 42

// Set value from pointer
const setFooBar = JsonPointer.set(fooBarPointer);
getFooBar(value, 33); // 33
```

Contributing
------------

### Tests

Run the tests

```bash
npm test
```

Run the tests with a continuous test runner
```bash
npm test -- --watch
```
