# Errors

Errors are classes that extend `Error` or `TypeError`, so they can be told
apart without matching messages. Each carries the pointer, and where
applicable, the location where it stopped.

| Thrown when | v1 |
| --- | --- |
| The pointer is invalid | `Error("Invalid JSON Pointer")` |
| A segment before the last doesn't lead to an object or an array | `TypeError` |
| A segment applied to an array isn't an index or `-` | (not an error) |

The location in a message is built only when the error is thrown, not at
every step, because it's only needed then.

## Open questions

- **Names and properties.** For example `InvalidPointerError`,
  `NotAContainerError` and `InvalidIndexError`, with `pointer` and
  `location`.
- **Messages.** v1's say `Value at '/email' is undefined and does not have
  property 'domain'`. Keep them?
