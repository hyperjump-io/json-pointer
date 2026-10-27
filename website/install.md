# Install

```bash
npm install @hyperjump/json-pointer
```

It's an ES module with no dependencies, and it works the same in Node.js
and browsers. Import it as a namespace:

```javascript
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
| `Getter` | `(subject: Json) => Json \| undefined` |
| `Setter` | `(subject: Json, value: Json) => Json` |
| `Assigner` | `(subject: Json, value: Json) => void` |
| `Unsetter` | `(subject: Json) => Json \| undefined` |
| `Remover` | `(subject: Json) => void` |

```typescript
import * as JsonPointer from "@hyperjump/json-pointer";
import type { Getter, Json } from "@hyperjump/json-pointer";

const getName: Getter = JsonPointer.get("/name");
const people: Json[] = [{ name: "Ada" }, { name: "Grace" }];
people.map(getName); // ["Ada", "Grace"]
```
