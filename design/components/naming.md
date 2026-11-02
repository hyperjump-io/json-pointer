# Naming

Every name has to make sense on its own, imported by name, without a
namespace in front of it. `get` only makes sense as `JsonPointer.get`.

The functions are the v1 namespace names with `pointer` in front:
`pointerGet`, `pointerSet`, `pointerAssign`, `pointerUnset`,
`pointerRemove`, `pointerParse`, `pointerStringify`, and `pointerAppend`.
The types named after them follow: `PointerGetter`, `PointerSetter`,
`PointerAssigner`, `PointerUnsetter`, `PointerRemover`, and
`PointerSegments`.

It's one rule, so every name can be guessed from the others, and they all
sort together in an editor's completions. `pointer` is short, which
matters in curried calls passed to `map`, and it matches the `Pointer`
type and v1's `pointerSegments`. Where JSON is what's being worked with,
"pointer" can only mean a JSON Pointer.

`parse` and `stringify` take the prefix too, though `parsePointer` reads
better. A rule with exceptions has to be memorized. `pointerParse` still
pairs with `JSON.parse` (see
[Pointers](pointers.md#segments-as-a-pointer)).

These keep their names, because they already make sense on their own:

- The error classes, which name what went wrong: `InvalidPointerError`,
  `NotAContainerError`, `InvalidIndexError`.
- `Json`, `JsonObject`, `ReadonlyJson`, `ReadonlyJsonObject`, and
  `Pointer`.

Importing the package as a namespace still works, but
`JsonPointer.pointerGet` repeats itself. The docs use named imports.

## `nil`

v1's `nil`, the empty pointer, is removed. Without a namespace it means
nothing, and `""` is shorter and says the same thing. A literal `""` is
also typed `""`, so it picks the empty pointer's overloads of `pointerSet`
and `pointerUnset` the way `nil` did (see
[Types](types.md#what-pointerset-and-pointerunset-return)).

## Rejected

- **Names that only work under a namespace**, as in v1. Code that imports
  `get` by name has a `get` that could be anything.
- **A `jsonPointer` prefix.** It's unambiguous next to any other import,
  but `jsonPointerStringify` is long, and `json` adds nothing in code that
  works with JSON.
- **Verb first, like `getPointer`.** It reads as getting a pointer, not
  getting a value by one.
- **An `At` suffix, like `getAt` and `removeAt`.** It reads well, but
  `removeAt` sounds like removing an array item by index, it doesn't say
  "pointer", and `parse` and `stringify` don't fit it.
- **Verb first for only `parsePointer` and `stringifyPointer`.** Then
  which names are prefixed has to be remembered.
- **`nilPointer` or `pointerNil`.** A name for `""` is longer than `""`.
