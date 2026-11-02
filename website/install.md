# Install

To install the package, run the following command:

```bash
npm install @hyperjump/json-pointer
```

The package is an ES module with no dependencies, and it works the same in
Node.js and browsers. Import the functions that you
use:

```typescript
import { pointerGet, pointerSet } from "@hyperjump/json-pointer";
```

## TypeScript

The package includes its type declarations. Besides the functions, it
exports types for JSON values. It also exports types for the functions that
`pointerGet`, `pointerSet`, `pointerAssign`, `pointerUnset`, and
`pointerRemove` return when you give them only a pointer. For more
information about those functions, see
[Apply a pointer many times](get-values.md#apply-a-pointer-many-times).

The package exports the following types:

| Type | Description |
| --- | --- |
| `Json` | Any JSON value: a string, number, boolean, null, object, or array |
| `JsonObject` | A JSON object |
| `ReadonlyJson` | A readonly JSON value, like one declared `as const` |
| `ReadonlyJsonObject` | A readonly JSON object |
| `PointerSegments` | A pointer's unescaped segments: `readonly string[]` |
| `Pointer` | A pointer as a string, or its `PointerSegments` |
| `PointerGetter` | The function that `pointerGet(pointer)` returns |
| `PointerSetter` | The function that `pointerSet(pointer)` returns |
| `PointerAssigner` | The function that `pointerAssign(pointer)` returns: `(subject: Json, value: Json) => void` |
| `PointerUnsetter` | The function that `pointerUnset(pointer)` returns |
| `PointerRemover` | The function that `pointerRemove(pointer)` returns: `(subject: Json) => void` |

For example, a `PointerGetter` can type a function that you pass to `map`:

```typescript
import { pointerGet } from "@hyperjump/json-pointer";
import type { Json, PointerGetter } from "@hyperjump/json-pointer";

const getName: PointerGetter = pointerGet("/name");
const people: Json[] = [{ name: "Ada" }, { name: "Grace" }];
people.map(getName); // ["Ada", "Grace"]
```

## Readonly values

`pointerGet`, `pointerSet`, and `pointerUnset` don't change their subject,
so they accept a `ReadonlyJson`. When the subject is readonly, so is the
value that they return. `pointerAssign` and `pointerRemove` change their
subject, so they accept only a `Json`:

```typescript
const doc = { name: "Ada", languages: ["English"] } as const;

pointerGet("/languages", doc); // ReadonlyJson | undefined
pointerAssign("/name", doc, "Grace"); // type error
```
