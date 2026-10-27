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
nothing to step into, and `get` throws a `TypeError` that says where it
stopped:

```typescript
JsonPointer.get("/email/domain", doc);
JsonPointer.get("/name/first", doc);
```

```text
TypeError: Value at '/email' is undefined and does not have property 'domain'
TypeError: Value at '/name' is a string and does not have property 'first'
```

Only a value's own properties count. `/toString` doesn't find a method on
an object, and `/length` doesn't find an array's length.

## Arrays

A segment that steps into an array is an index, starting from `0`. The
segment `-` is the position after the last item, for adding an item (see
[Changing values](changing-values.md#arrays)). There's never a value
there, so `get` returns `undefined` for it.

## Errors

| Error | When |
| --- | --- |
| `Error` with the message `Invalid JSON Pointer` | The pointer isn't valid (see [Invalid pointers](pointers.md#invalid-pointers)). Thrown by `get(pointer)` too, before there's a subject. |
| `TypeError` | A segment before the last doesn't lead to an object or an array |
