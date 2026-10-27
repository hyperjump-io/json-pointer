# Types

The API is declared in `src/index.d.ts`, with type tests in
`src/index.test-d.ts`.

## Readonly subjects

`get`, `set`, and `unset` don't change their subject, so they take a
`ReadonlyJson`, which includes values declared `as const`. What they return
is part of the subject, or shares parts of it, so it's readonly if the
subject is (`Shared<T>`). `set`'s result also includes `value`, so it's
readonly if either one is. `assign` and `remove` change the subject, so
they take only a `Json`, and `assign` only takes a `Json` value, because it
becomes part of something that can be changed.

`Shared<T>` is `[T] extends [Json] ? Json : ReadonlyJson`. The brackets keep
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

## Error constructors

The error classes have private constructors in the declarations. Only this
package throws them, and a public constructor would make its arguments part
of the API (see [Errors](errors.md)).
