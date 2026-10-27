# Design

A from-scratch rewrite of `@hyperjump/json-pointer` v1 (`../json-pointer`,
the `main` branch). The concepts are the same: get, set, and remove values
by pointer, either returning a new value or changing it in place, with a
curried form that parses a pointer once. What changed is mostly what v1
got wrong about its own rules.

These documents record the decisions made so far, and why. The `.d.ts`
files in `src/` are the source of truth for the API. They're written by
hand and have JSDoc explaining the details. Documentation for users is in
[`website/`](../website/README.md).

## Goals

- Behave like JavaScript does for the same operation (see
  [Do what JavaScript does](principles/javascript-semantics.md)).
- Small and fast, with no dependencies, for Node.js and browsers.
- Dependent projects (`@hyperjump/json-schema`, `@hyperjump/browser`)
  don't need to keep working. They'll be updated for whatever v2 ends up
  being. A major version is fine, but it isn't a goal.

## How it's organized

- **[Principles](principles/README.md)**: the rules decisions are made by.
- **[Style](style/README.md)**: how code here is laid out and written.
- **Components**: how each part works, what was decided, and what was
  rejected. Open questions and known limitations are with the component
  they're about.

## Components

- [Pointers](components/pointers.md): parsing, validating, escaping, and
  building pointers
- [Currying](components/currying.md): applying a pointer many times
- [Getting values](components/getting-values.md): `get`
- [Changing values](components/changing-values.md): `set`, `assign`,
  `unset`, and `remove`
- [Errors](components/errors.md)
- [What changed from v1](components/v1.md)
