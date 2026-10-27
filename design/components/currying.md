# Currying

Every function that takes a pointer and a subject can take just the
pointer, and returns a function that takes the rest.

```javascript
const getName = get("/name");
people.map(getName);
```

The pointer is parsed and validated when it's given, once, however many
times the function is used (see
[Fail where the mistake is](../principles/fail-early.md)). Giving
segments skips parsing (see [Pointers](pointers.md#segments-as-a-pointer)).

v1 parsed eagerly in `get` but on first use in `set`, `assign`, `unset`,
and `remove`. That wasn't a decision: commit `6bbcbe5` made parsing happen
once instead of on every call, and kept errors thrown when the function was
called so behavior didn't change.

## Rejected

- **No currying.** It's the reason to have a curried form at all:
  `people.map(get("/name"))`.

## Open questions

- **How the forms are told apart.** v1 checks `subject === undefined`, so
  `get(pointer, undefined)` returns a function. Counting the arguments
  instead would make `get(pointer, undefined)` throw like any other
  non-container, at the cost of rest parameters.
