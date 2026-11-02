# Migrate from v1

v2 has the same functions as v1, and they do the same things, but each one
has a new name. The following sections list each change that can break
code, and what to do about it.

## Functions have new names

Each name starts with `pointer`, so it makes sense on its own when you
import it by name. The following table shows the v2 name for each v1
function:

| v1 | v2 |
| --- | --- |
| `get` | `pointerGet` |
| `set` | `pointerSet` |
| `assign` | `pointerAssign` |
| `unset` | `pointerUnset` |
| `remove` | `pointerRemove` |
| `append` | `pointerAppend` |
| `pointerSegments` | `pointerParse`. For more information, see [The `pointerParse` function replaces `pointerSegments`](#the-pointerparse-function-replaces-pointersegments). |
| `nil` | Removed. Use `""`. |

Import the functions by name instead of as a namespace:

```typescript
// v1
import * as JsonPointer from "@hyperjump/json-pointer";
JsonPointer.get("/foo", doc);

// v2
import { pointerGet } from "@hyperjump/json-pointer";
pointerGet("/foo", doc);
```

The types that the curried functions return have new names too. For more
information, see [Types](#types).

## The `pointerParse` function replaces `pointerSegments`

`pointerParse` returns an array instead of a generator. It throws for an
invalid pointer when you call it, not when you start iterating:

```typescript
// v1
[...JsonPointer.pointerSegments("/foo/a~1b")]; // ["foo", "a/b"]

// v2
pointerParse("/foo/a~1b"); // ["foo", "a/b"]
```

Every function also accepts segments in place of a pointer, and
`pointerStringify` turns segments back into a pointer. For more
information, see [Segments](pointers.md#segments).

## Errors are classes

Each error has its own class, so you can tell them apart with `instanceof`
instead of checking their messages. The following table shows the v2 error
for each v1 error:

| v1 | v2 |
| --- | --- |
| `Error` with the message `Invalid JSON Pointer` | `InvalidPointerError`, which extends `Error` |
| `TypeError` | `NotAContainerError`, which extends `TypeError` |
| No error | `InvalidIndexError`, which extends `TypeError` |

Code that checks for `TypeError` keeps working. Code that compares the
invalid pointer message exactly breaks, because v2's message includes the
pointer:

```text
InvalidPointerError: Invalid JSON Pointer: 'foo'
```

The other messages are the same as v1's.

## Array segments must be indexes

A segment that steps into an array has to be an index or `-`. Any other
segment, like `foo`, `-1`, or `length`, throws an `InvalidIndexError`. In
v1, `get` returned `undefined` for it, and `set` added a property to the
array.

An array in JSON has only items, so `JSON.stringify` drops any property
that you add to an array. v2 throws instead. For more information, see
[Arrays](get-values.md#arrays).

## Curried functions check the pointer right away

When you give `pointerSet`, `pointerAssign`, `pointerUnset`, or
`pointerRemove` only a pointer, they parse it right away, like v1's `get`
always did. An invalid pointer throws where you wrote it, not later when
you use the returned function:

```typescript
const setName = pointerSet("name"); // throws in v2
```

How many arguments you give a function decides whether it returns a
function. v1 checked whether the subject was `undefined`, so
`get(pointer, undefined)` returned a function. In v2,
`pointerGet(pointer, undefined)` is a call with an `undefined` subject, so
it throws a `NotAContainerError`. If a subject might be `undefined`, check
it before you call the function.

## The `pointerUnset` function returns the subject when there's nothing to remove

v1's `unset` always returned a copy. v2 returns `subject` itself when the
value isn't there, so you can use `===` to tell whether anything changed.

## Types

The types changed in the following ways:

- The types for the curried functions have new names: `Getter`,
  `Setter`, `Assigner`, `Unsetter`, and `Remover` are now
  `PointerGetter`, `PointerSetter`, `PointerAssigner`, `PointerUnsetter`,
  and `PointerRemover`.
- `pointerSet` and `pointerUnset` return a value with the subject's type
  instead of `Json`, so you can read properties off the result without a
  cast. For more information, see
  [TypeScript](change-values.md#typescript).
- `pointerGet`, `pointerSet`, and `pointerUnset` accept readonly values,
  like ones declared `as const`. For more information, see
  [Readonly values](install.md#readonly-values).
- `PointerGetter`, `PointerSetter`, and `PointerUnsetter` are generic, so
  they return readonly values for readonly subjects.
- `Pointer`, `PointerSegments`, `ReadonlyJson`, and `ReadonlyJsonObject`
  are new.
