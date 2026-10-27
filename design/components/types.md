# Types

The API is declared in `src/index.d.ts`, with type tests in
`src/index.test-d.ts`.

## Readonly subjects

`get`, `set`, and `unset` don't change their subject, so they take a
`ReadonlyJson`, which includes values declared `as const`. What they return
is part of the subject, or shares parts of it, so it's readonly if the
subject is (see
[What `set` and `unset` return](#what-set-and-unset-return)). `assign` and
`remove` change the subject, so they take only a `Json`, and `assign` only
takes a `Json` value, because it becomes part of something that can be
changed.

`get` returns `Shared<T>`, which is
`[T] extends [Json] ? Json : ReadonlyJson`. The brackets keep
it from distributing over a union, so a union with anything readonly in it
is readonly.

TypeScript doesn't enforce `readonly` on object properties when checking
assignability, only on arrays. An `as const` object with no arrays in it is
a `Json`, and what's found in it isn't readonly.

### Rejected

- **Overloads**, one for `Json` and one for `ReadonlyJson`. When an
  overloaded function is passed as a callback, as in
  `people.map(get("/name"))`, TypeScript uses the last overload, so the
  curried form would always return `ReadonlyJson`, or always take only a
  `Json`. A generic `Getter` is instantiated for each call.
- **Returning `ReadonlyJson` always.** Changing what `get` finds in a value
  that can be changed is ordinary, and v1 allowed it.

## What `set` and `unset` return

`set` and `unset` return the subject's type, `T`. A pointer is a string, so
the type of what's at it can't be known, and `T` is right as long as
`value` has the type of what it replaces, which is the common case. It
makes `JsonPointer.set("/address/city", doc, "Paris").address.city` work
without a cast. A readonly subject gives a readonly result, because `T` is
readonly.

The empty pointer has overloads of its own, because the result isn't the
subject: `set` returns `value`'s type and `unset` returns `undefined`.
`nil` is typed `""`, so `set(nil, …)` picks them. A `string` that happens
to be empty doesn't.

`get` returns `Json` (`Shared<T>`), since what it finds is only part of
`T`.

### Rejected

- **`Json`, or `ReadonlyJson` for a readonly subject**, as v1 did. It's
  exact, but every property read on the result needs a cast, including in
  the docs' own examples.
- **Readonly when `value` is.** Returning `T` ignores a readonly `value`,
  which ends up in the result. Tracking it gave up `T` for a union, for a
  case that rarely matters.

## Error constructors

The error classes have private constructors in the declarations. Only this
package throws them, and a public constructor would make its arguments part
of the API (see [Errors](errors.md)).
