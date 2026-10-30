# Migrating from v1

v2 has the same functions as v1, and they do the same things. Most code
works without changes. Most of the changes fix things v1 got wrong: it read
array indexes too loosely, and it mishandled `__proto__`. This page lists
everything that can break and what to do about it.

## `pointerSegments` is replaced by `parse`

`parse` returns an array instead of a generator. It throws for an invalid
pointer as soon as it's called, not when you start iterating.

```typescript
// v1
[...JsonPointer.pointerSegments("/foo/a~1b")]; // ["foo", "a/b"]

// v2
JsonPointer.parse("/foo/a~1b"); // ["foo", "a/b"]
```

Every function also accepts segments in place of a pointer. `stringify`
turns segments back into a pointer. See [Segments](pointers.md#segments).

## Errors are classes

Each error has its own class. You can tell them apart with `instanceof`
instead of checking their messages.

| v1 | v2 |
| --- | --- |
| `Error` with the message `Invalid JSON Pointer` | `InvalidPointerError`, which extends `Error` |
| `TypeError` | `NotAContainerError`, which extends `TypeError` |
| (no error) | `InvalidIndexError`, which extends `TypeError` |

Code that checks for `TypeError` keeps working. Code that compares the
invalid pointer message exactly will break, because the message now
includes the pointer:

```text
InvalidPointerError: Invalid JSON Pointer: 'foo'
```

The other messages are the same as v1's.

## Array indexes are strict

A segment that steps into an array has to be `-` or an index without
leading zeros. v1 read the segment with `parseInt`, so it accepted segments
that JavaScript doesn't treat as indexes.

| Segment | v1 | v2 |
| --- | --- | --- |
| `01`, `1x`, ` 1` | Item 1 | Throws `InvalidIndexError` |
| `foo`, `-1`, `length` | `get` returned `undefined` and `set` added a property to the array | Throws `InvalidIndexError` |

An array in JSON only has items, so a property added to an array is lost
when it's written with `JSON.stringify`. v2 throws instead. See
[Arrays](getting-values.md#arrays).

## Curried functions check the pointer right away

When you give `set`, `assign`, `unset`, or `remove` just a pointer, they
parse it right away, like `get` always did. An invalid pointer throws where
it's written, not later when you use the returned function.

```typescript
const setName = JsonPointer.set("name"); // throws in v2
```

Whether a function is curried depends on how many arguments you give it.
v1 checked whether the subject was `undefined`, so `get(pointer, undefined)`
returned a function. In v2 that's a call with an `undefined` subject, so it
throws a `NotAContainerError`. If a subject might be `undefined`, check it
before you call.

## `__proto__` is an ordinary property

In v1, `set` and `assign` with `/__proto__` changed the value's prototype.
What was set was then lost when it was written with `JSON.stringify`. v2
sets it as an ordinary property, the way `JSON.parse` does.

## `unset` returns the same value when there's nothing to remove

v1 always returned a copy. v2 returns `subject` itself when the value isn't
there, so you can use `===` to tell whether anything changed.

## Types

- `set` and `unset` return a value with the subject's type instead of
  `Json`. You can read properties off the result without a cast. See
  [TypeScript](changing-values.md#typescript).
- `get`, `set`, and `unset` accept readonly values, like ones declared
  `as const`. See
  [Values that can't be changed](install.md#values-that-cant-be-changed).
  `Getter`, `Setter`, and `Unsetter` are now generic, so they return
  readonly values for readonly subjects. Code that annotates a variable
  with them keeps working.
- `Pointer`, `Segments`, `ReadonlyJson`, and `ReadonlyJsonObject` are new.
