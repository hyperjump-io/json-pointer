# Comparison with v1

First recorded 2026-10-26, against v1 at `01948aa` (1.1.3 plus docs).

`benchmark/compare.bench.js` times each operation in v1 and v2 on the same
small document, for an object path (`/address/geo/lat`), an array path
(`/items/42/tags/1`, in a 100-item array), and an escaped path. Times are
the mean per call.

| Benchmark | v1 | v2 | v2/v1 |
| --- | --- | --- | --- |
| parse | 229 ns | 96 ns | 0.42x |
| parse with escapes | 520 ns | 392 ns | 0.75x |
| append | 58 ns | 51 ns | 0.88x |
| get, object path | 251 ns | 282 ns | 1.12x |
| get curried, object path | 82 ns | 81 ns | 0.99x |
| get, array path | 275 ns | 309 ns | 1.12x |
| get curried, array path | 109 ns | 98 ns | 0.90x |
| get, escaped path | 470 ns | 477 ns | 1.02x |
| get curried, escaped path | 66 ns | 66 ns | 1.00x |
| get, array path, v2 given segments | 345 ns | 109 ns | 0.32x |
| set, object path | 345 ns | 385 ns | 1.12x |
| set, array path | 521 ns | 546 ns | 1.05x |
| set, append to array | 396 ns | 413 ns | 1.04x |
| set curried, array path | 302 ns | 300 ns | 0.99x |
| assign, array path | 518 ns | 372 ns | 0.72x |
| unset, array path | 623 ns | 559 ns | 0.90x |
| unset, not there | 413 ns | 288 ns | 0.70x |
| assign then remove, object path | 655 ns | 492 ns | 0.75x |

- v1's `parse` row is `pointerSegments` spread into an array, which isn't
  what v1's `get` uses internally, so it overstates the difference.
- Curried, v2 is at parity with v1 or faster. Uncurried `get` and `set` are
  about 10% slower, which is most of what's left after the changes below.
  `set` checks that each property on the way is an own property, which v1
  didn't, and that's how v1 read `__proto__` from the prototype.
- Giving segments instead of a string skips parsing, and is 3 times faster
  than v1 with a string.
- `unset` is faster when nothing is there because it returns the subject
  instead of copying the path.

## What changed to get there

The first version was 1.4–2 times slower than v1 for `get` and 1.1–1.5
times slower for `set`. Measured with a quick Node script on the hot paths,
one change at a time:

| Change | get, object | get, array | set, object | set, array |
| --- | --- | --- | --- | --- |
| First version | 1.30x | 1.41x | 1.37x | 1.44x |
| `Object.hasOwn` instead of `propertyIsEnumerable` | 1.02x | 1.16x | 1.10x | 1.27x |
| A character loop instead of a regex in `isIndex` | 1.02x | 1.02x | 1.07x | 1.16x |
| Number keys for array indexes | 1.02x | 0.98x | 1.11x | 1.12x |

- `propertyIsEnumerable` was the biggest cost, and checking it alone, with
  the other two changes, was still 1.3–1.4 times slower than v1. It was
  replaced by `Object.hasOwn` (see
  [Getting values](../components/getting-values.md#rejected)).
- V8 converts a string key to an index on every array access. v1 used
  `parseInt`, so it had numbers.
- Copying arrays with `slice` to keep holes costs the same as v1's spread.
