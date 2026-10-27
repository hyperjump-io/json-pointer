# Getting values

`get(pointer, subject)` returns the value the pointer identifies in
`subject`.

```typescript
const doc = {
  name: "Ada",
  languages: ["English", "French"]
};

JsonPointer.get("/name", doc); // "Ada"
JsonPointer.get("/languages/1", doc); // "French"
JsonPointer.get("", doc); // doc itself
```

The value is the one in `subject`, not a copy, so changing it changes
`subject`.

## Applying a pointer many times

Give `get` just a pointer, and it returns a function that takes the
subject. The pointer is parsed once, however many times you use the
function.

```typescript
const getName = JsonPointer.get("/name");

const people = [{ name: "Ada" }, { name: "Grace" }];
people.map(getName); // ["Ada", "Grace"]
```

`set`, `assign`, `unset`, and `remove` work the same way (see
[Changing values](changing-values.md#applying-a-pointer-many-times)).

## When a value isn't there

If the last segment names a property or item that doesn't exist, `get`
returns `undefined`. A JSON value is never `undefined`, so it always means
the value isn't there. A value that's `null` is returned as `null`.

```typescript
JsonPointer.get("/email", doc); // undefined
JsonPointer.get("/languages/5", doc); // undefined
```

If a segment before the last doesn't lead to an object or an array, there's
nothing to step into, and `get` throws a `NotAContainerError` that says
where it stopped:

```typescript
JsonPointer.get("/email/domain", doc);
JsonPointer.get("/name/first", doc);
```

```text
NotAContainerError: Value at '/email' is undefined and does not have property 'domain'
NotAContainerError: Value at '/name' is a string and does not have property 'first'
```

Only a value's own properties count, not inherited ones. `/toString`
doesn't find a method on an object.
`/length` on an array throws, because `length` isn't an index (see
[Arrays](#arrays)).

## Arrays

A segment that steps into an array is an index, starting from `0`, written
without leading zeros, so `/01` isn't an index. The segment `-` is the
position after the last item, for adding an item (see
[Changing values](changing-values.md#arrays)). There's never a value
there, so `get` returns `undefined` for it.

Any other segment, like `/01` or `/name`, throws an `InvalidIndexError`. An array in
JSON has only items, so there's nothing else for it to name.

## Errors

| Error | When |
| --- | --- |
| `InvalidPointerError` | The pointer isn't valid (see [Invalid pointers](pointers.md#invalid-pointers)). Thrown by `get(pointer)` too, before there's a subject. |
| `NotAContainerError` | A segment before the last doesn't lead to an object or an array |
| `InvalidIndexError` | A segment that steps into an array isn't an index or `-` |

`NotAContainerError` and `InvalidIndexError` extend `TypeError`, and have
the pointer, the `location` where it stopped, and the `segment` it
couldn't apply.
