# Install

To install the package, run the following command:

```bash
npm install @hyperjump/json-pointer
```

The package is an ES module with no dependencies, and it works the same in
Node.js and browsers. Import it as a namespace:

```typescript
import * as JsonPointer from "@hyperjump/json-pointer";
```

## TypeScript

The package includes its type declarations. Besides the functions, it
exports types for JSON values. It also exports types for the functions that
`get`, `set`, `assign`, `unset`, and `remove` return when you give them only
a pointer. For more information about those functions, see
[Apply a pointer many times](get-values.md#apply-a-pointer-many-times).

The package exports the following types:

| Type | Description |
| --- | --- |
| `Json` | Any JSON value: a string, number, boolean, `null`, object, or array |
| `JsonObject` | A JSON object |
| `ReadonlyJson` | A readonly JSON value, like one declared `as const` |
| `ReadonlyJsonObject` | A readonly JSON object |
| `Segments` | A pointer's unescaped segments: `readonly string[]` |
| `Pointer` | A pointer as a string, or its `Segments` |
| `Getter` | The function that `get(pointer)` returns |
| `Setter` | The function that `set(pointer)` returns |
| `Assigner` | The function that `assign(pointer)` returns: `(subject: Json, value: Json) => void` |
| `Unsetter` | The function that `unset(pointer)` returns |
| `Remover` | The function that `remove(pointer)` returns: `(subject: Json) => void` |

For example, a `Getter` can type a function that you pass to `map`:

```typescript
import * as JsonPointer from "@hyperjump/json-pointer";
import type { Getter, Json } from "@hyperjump/json-pointer";

const getName: Getter = JsonPointer.get("/name");
const people: Json[] = [{ name: "Ada" }, { name: "Grace" }];
people.map(getName); // ["Ada", "Grace"]
```

## Readonly values

`get`, `set`, and `unset` don't change their subject, so they accept a
`ReadonlyJson`. When the subject is readonly, so is the value that they
return. `assign` and `remove` change their subject, so they accept only a
`Json`:

```typescript
const doc = { name: "Ada", languages: ["English"] } as const;

JsonPointer.get("/languages", doc); // ReadonlyJson | undefined
JsonPointer.assign("/name", doc, "Grace"); // type error
```
