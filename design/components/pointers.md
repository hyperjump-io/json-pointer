# Pointers

A pointer is a string, like `/foo/0`, or the list of segments it's parsed
into, like `["foo", "0"]`. Every function that takes a pointer takes
either one.

## Parsing and validating

A pointer is invalid if it isn't empty and doesn't start with `/`, or if
it has a `~` that isn't followed by `0` or `1`. Parsing checks both and
unescapes `~1` to `/` and `~0` to `~`. Segments are always strings, array
indexes included.

Unescaping is skipped when the pointer has no `~`, and the `~` check only
runs when there's one, because most pointers have none. That was measured
in v1 (commit `6bbcbe5`).

## Segments as a pointer

`parse(pointer)` returns the segments and `stringify(segments)` escapes
them back into a pointer. A function given segments uses them as they are,
without parsing or validating, since there's nothing to validate: any
string is a valid segment.

Code that builds a pointer from parts, like a schema walker, can keep the
segments and never escape and re-parse them.

The names match `JSON.parse` and `JSON.stringify`: a string to a
structure, and back.

### Rejected

- **`toSegments`/`fromSegments`.** They say what you get, but they don't
  pair as naturally as `parse` and `stringify`.
- **Keeping v1's `pointerSegments` generator.** It duplicates `parse`, and
  it only validates once iteration starts. Arrays are also much faster to
  work with than a generator (v1 commit `6bbcbe5`).
- **Only strings**, as in v1. Parsing was internal, so a caller with
  segments had to escape them into a string only for it to be parsed back.
- **A `compile(pointer)` that returns `{ get, set, … }`.** It's a second
  way to do what currying already does (see [Currying](currying.md)).

## Building pointers

`nil` is the empty pointer, `""`, the whole document.
`append(segment, pointer)` escapes `segment` and adds it to the end of
`pointer`. The segment comes first so `append` reads like the curried
functions: what's applied, then what it's applied to.

### Rejected

- **`append(pointer, ...segments)`.** It reads naturally on its own, but
  it's a different order from everything else.

## Array indexes

A segment applied to an array is an index if it's `0` or `[1-9][0-9]*` and
at most `4294967294` (`2**32 - 2`), the same strings JavaScript treats as
array indexes. A larger number is an ordinary property in JavaScript,
which `JSON.stringify` drops. `-` is the position after the last item. Any other segment applied to an array throws (see
[Don't lose data silently](../principles/dont-lose-data.md)).

v1 used `parseInt`, so `/01`, `/1x`, and `/ 1` were all item 1, `/foo`
was `NaN`, and `set` wrote a `"NaN"` property onto the array.
