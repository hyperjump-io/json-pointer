# Install

```bash
npm install @hyperjump/json-pointer
```

It's an ES module with no dependencies, and it works the same in Node.js
and browsers. Import it as a namespace:

```typescript
import * as JsonPointer from "@hyperjump/json-pointer";
```

## TypeScript

The package includes its type declarations. Besides the functions, it
exports types for JSON values and for the functions that `get`, `set`,
`assign`, `unset`, and `remove` return when they're given just a pointer
(see [Getting values](getting-values.md#applying-a-pointer-many-times)).

| Type | Is |
| --- | --- |
| `Json` | Any JSON value: a string, number, boolean, `null`, object, or array |
| `JsonObject` | A JSON object |
| `ReadonlyJson` | A JSON value that can't be changed, like one declared `as const` |
| `ReadonlyJsonObject` | A JSON object that can't be changed |
| `Segments` | A pointer's segments, unescaped: `readonly string[]` |
| `Pointer` | A pointer as a string, or its `Segments` |
| `Getter` | The function `get(pointer)` returns |
| `Setter` | The function `set(pointer)` returns |
| `Assigner` | `(subject: Json, value: Json) => void` |
| `Unsetter` | The function `unset(pointer)` returns |
| `Remover` | `(subject: Json) => void` |

```typescript
import * as JsonPointer from "@hyperjump/json-pointer";
import type { Getter, Json } from "@hyperjump/json-pointer";

const getName: Getter = JsonPointer.get("/name");
const people: Json[] = [{ name: "Ada" }, { name: "Grace" }];
people.map(getName); // ["Ada", "Grace"]
```

## Values that can't be changed

`get`, `set`, and `unset` don't change their subject, so they take a
`ReadonlyJson`, and what they return is readonly when the subject is.
`assign` and `remove` change it, so they take only a `Json`.

```typescript
const doc = { name: "Ada", languages: ["English"] } as const;

JsonPointer.get("/languages", doc); // ReadonlyJson | undefined
JsonPointer.assign("/name", doc, "Grace"); // type error
```
