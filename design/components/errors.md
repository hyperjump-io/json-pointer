# Errors

Each error is its own class, so it can be told apart with `instanceof`
instead of by its message.

| Class | Extends | Properties | Thrown when |
| --- | --- | --- | --- |
| `InvalidPointerError` | `Error` | `pointer` | The pointer is invalid (see [Pointers](pointers.md#parsing-and-validating)) |
| `NotAContainerError` | `TypeError` | `pointer`, `location`, `segment` | A segment before the last doesn't lead to an object or an array |
| `InvalidIndexError` | `TypeError` | `pointer`, `location`, `segment` | A segment applied to an array isn't an index or `-` (see [Pointers](pointers.md#array-indexes)) |

`pointer` is the pointer that was given, `location` is the pointer to the
value the segment was applied to, and `segment` is the segment, unescaped.

The messages keep v1's form, and the invalid pointer's message includes
the pointer:

```text
InvalidPointerError: Invalid JSON Pointer: 'foo'
NotAContainerError: Value at '/email' is undefined and does not have property 'domain'
InvalidIndexError: Value at '/languages' is an array and 'first' isn't an index
```

The constructors are private in the declarations, so throwing them isn't
part of the API (see [Types](types.md#error-constructors)).

`location` and the message are built only when the error is thrown, not at
every step, because they're only needed then.

## Rejected

- **`Error` and `TypeError` only**, as in v1. Callers could only tell
  errors apart by their messages.
- **One `JsonPointerError` with a `code`.** It's one export instead of
  three, but `instanceof` is more idiomatic, and `NotAContainerError` and
  `InvalidIndexError` can still extend `TypeError`.
