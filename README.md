JSON Pointer
============

This is an implementation of RFC-6901 JSON Pointer. JSON Pointer is designed for
referring to data values within a JSON document. It's designed to be URL
friendly so I can be used as a URL fragment that points to a specific part of
the JSON document.

Installation
------------

```bash
npm install @hyperjump/json-pointer --save
```

Usage
-----

```javascript
import * as JsonPointer from "@hyperjump/json-pointer";

const value = {
  "foo": {
    "bar": 2
  }
};

const foobar = JsonPointer.get("/foo/bar");
foobar(value); // 2
JsonPointer.append("/foo", "bar"); // "/foo/bar"
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
