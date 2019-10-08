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
// New value is returned without modifying the original
const setFooBar = JsonPointer.set(fooBarPointer);
setFooBar(value, 33); // { "foo": { "bar": 33 } }

// Mutate value from pointer
// The original value is changed and no value is returned
const mutateFooBar = JsonPointer.mutate(fooBarPointer);
mutateFooBar(value, 33); // { "foo": { "bar": 33 } }
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
