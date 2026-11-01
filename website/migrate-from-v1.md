# Migrate from v1

v2 has the same functions as v1, and they do the same things, so most code
works without changes. Most of the changes fix things that v1 got wrong: it
read array indexes too loosely, and it mishandled `__proto__`. The
following sections list each change that can break code, and what to do
about it.

## The `parse` function replaces `pointerSegments`

`parse` returns an array instead of a generator. It throws for an invalid
pointer when you call it, not when you start iterating:

```typescript
// v1
[...JsonPointer.pointerSegments("/foo/a~1b")]; // ["foo", "a/b"]

// v2
JsonPointer.parse("/foo/a~1b"); // ["foo", "a/b"]
```

Every function also accepts segments in place of a pointer, and `stringify`
turns segments back into a pointer. For more information, see
[Segments](pointers.md#segments).

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

## Array indexes are strict

A segment that steps into an array has to be `-` or an index without
leading zeros. v1 read the segment with `parseInt`, so it accepted segments
that JavaScript doesn't treat as indexes. The following table shows what
each version does with them:

| Segment | v1 | v2 |
| --- | --- | --- |
| `01`, `1x`, ` 1` | Item 1 | Throws `InvalidIndexError` |
| `foo`, `-1`, `length` | `get` returned `undefined` and `set` added a property to the array | Throws `InvalidIndexError` |

An array in JSON has only items, so `JSON.stringify` drops any property
that you add to an array. v2 throws instead. For more information, see
[Arrays](get-values.md#arrays).

## Curried functions check the pointer right away

When you give `set`, `assign`, `unset`, or `remove` only a pointer, they
parse it right away, like `get` always did. An invalid pointer throws where
you wrote it, not later when you use the returned function:

```typescript
const setName = JsonPointer.set("name"); // throws in v2
```

How many arguments you give a function decides whether it returns a
function. v1 checked whether the subject was `undefined`, so
`get(pointer, undefined)` returned a function. In v2, that's a call with an
`undefined` subject, so it throws a `NotAContainerError`. If a subject
might be `undefined`, check it before you call the function.

## The `__proto__` key is an ordinary property

In v1, `set` and `assign` with `/__proto__` changed the value's prototype,
and `JSON.stringify` then dropped what they set. v2 sets it as an ordinary
property, the way `JSON.parse` does.

## The `unset` function returns the subject when there's nothing to remove

v1 always returned a copy. v2 returns `subject` itself when the value isn't
there, so you can use `===` to tell whether anything changed.

## Types

The types changed in the following ways:

- `set` and `unset` return a value with the subject's type instead of
  `Json`, so you can read properties off the result without a cast. For
  more information, see [TypeScript](change-values.md#typescript).
- `get`, `set`, and `unset` accept readonly values, like ones declared
  `as const`. For more information, see
  [Readonly values](install.md#readonly-values).
- `Getter`, `Setter`, and `Unsetter` are generic in v2, so they return
  readonly values for readonly subjects. Code that annotates a variable
  with them keeps working.
- `Pointer`, `Segments`, `ReadonlyJson`, and `ReadonlyJsonObject` are new.
