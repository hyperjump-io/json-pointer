# Changing values

| | Returns a new value | Changes the value in place |
| --- | --- | --- |
| Set a value | `pointerSet(pointer, subject, value)` | `pointerAssign(pointer, subject, value)` |
| Remove a value | `pointerUnset(pointer, subject)` | `pointerRemove(pointer, subject)` |

## Copying

`pointerSet` and `pointerUnset` copy only the objects and arrays on the way
to the value. Everything else is shared with `subject`. If `pointerUnset`
has nothing to remove, it returns `subject` itself, so `===` tells whether
anything changed. v1 copied the path anyway.

## What has to exist

The object or array the value is set in or removed from has to exist.
Nothing on the way is created, so `/phone/home` throws if there's no
`/phone`, like `doc.phone.home = x` does.

## Arrays

These follow JavaScript (see
[Do what JavaScript does](../principles/javascript-semantics.md)):

- Setting an index replaces the item. Setting `-` adds an item to the end.
- Setting an index past the end leaves holes before it.
- Removing an item leaves a hole and doesn't move the items after it.
- Removing `-` removes nothing.

A segment that isn't an index or `-` throws (see
[Pointers](pointers.md#array-indexes)).

## `__proto__`

`__proto__` is set as an own property, with `Object.defineProperty`, the
way `JSON.parse` makes it. v1 assigned it, which changed the copy's
prototype, so the value disappeared from `JSON.stringify`.

## The whole document

With the empty pointer, `pointerSet` returns `value`, and `pointerUnset`
returns `undefined`. A value can't replace itself in place, so
`pointerAssign` and `pointerRemove` do nothing with it.

### Rejected

- **Throwing from `pointerAssign` and `pointerRemove` with the empty
  pointer.** Nothing JavaScript does is equivalent, so doing nothing is as
  defensible, and it's what v1 does.
