# Currying

Every function that takes a pointer and a subject can take just the
pointer, and returns a function that takes the rest.

```javascript
const getName = pointerGet("/name");
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

The curried form is the call with only a pointer, by argument count.
`pointerGet("/a", obj.missing)` throws, saying the value at `''` is
undefined, where the bug is. TypeScript already rejects an `undefined`
subject, so this is for JavaScript callers.

`pointerSet(pointer, subject)` and `pointerAssign(pointer, subject)`,
without a value, aren't curried either. They set `undefined`, like
`obj.x = undefined` does in JavaScript.

## Rejected

- **No currying.** It's the reason to have a curried form at all:
  `people.map(pointerGet("/name"))`.
- **Checking `subject === undefined`**, as v1 does. A subject that's
  missing by mistake silently returns a function, and the error shows up
  wherever that function ends up, if anywhere.
