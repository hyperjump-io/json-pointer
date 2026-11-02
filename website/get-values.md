# Get values

`pointerGet(pointer, subject)` returns the value that the pointer
identifies in `subject`:

```typescript
const doc = {
  name: "Ada",
  languages: ["English", "French"]
};

pointerGet("/name", doc); // "Ada"
pointerGet("/languages/1", doc); // "French"
pointerGet("", doc); // doc itself
```

The value is the one in `subject`, not a copy. If you change it, you change
`subject`.

## Apply a pointer many times

Give `pointerGet` only a pointer, and it returns a function that takes the
subject. `pointerGet` parses the pointer only once, no matter how many
times you use the function:

```typescript
const getName = pointerGet("/name");

const people = [{ name: "Ada" }, { name: "Grace" }];
people.map(getName); // ["Ada", "Grace"]
```

`pointerSet`, `pointerAssign`, `pointerUnset`, and `pointerRemove` work the
same way. For more information, see
[Apply a pointer many times](change-values.md#apply-a-pointer-many-times)
in Change values.

## Missing values

If the last segment names a property or item that doesn't exist,
`pointerGet` returns `undefined`. A JSON value is never `undefined`, so
`undefined` always means that the value isn't there. If the value is
`null`, `pointerGet` returns `null`.

```typescript
pointerGet("/email", doc); // undefined
pointerGet("/languages/5", doc); // undefined
```

If a segment before the last doesn't lead to an object or an array, there's
nothing to step into, and `pointerGet` throws a `NotAContainerError`. For
example, each of the following calls throws:

```typescript
pointerGet("/email/domain", doc);
pointerGet("/name/first", doc);
```

The errors say where `pointerGet` stopped:

```text
NotAContainerError: Value at '/email' is undefined and does not have property 'domain'
NotAContainerError: Value at '/name' is a string and does not have property 'first'
```

Only a value's own properties count, not inherited ones, so `/toString`
doesn't find a method on an object. `/length` on an array throws, because
`length` isn't an index. For more information, see [Arrays](#arrays).

## Arrays

A segment that steps into an array is an index. An index starts from `0`
and has no leading zeros, so `01` isn't an index.

The segment `-` is the position after the last item. There's never a value
there, so `pointerGet` returns `undefined` for it. You use `-` to add an
item. For more information, see [Arrays](change-values.md#arrays) in Change
values.

Any other segment, like `/01` or `/name`, throws an `InvalidIndexError`. An
array in JSON has only items, so there's nothing else for a segment to
name.

## Errors

`pointerGet` throws the following errors:

| Error | When |
| --- | --- |
| `InvalidPointerError` | The pointer isn't valid. `pointerGet(pointer)` throws it too, before there's a subject. For more information, see [Invalid pointers](pointers.md#invalid-pointers). |
| `NotAContainerError` | A segment before the last doesn't lead to an object or an array |
| `InvalidIndexError` | A segment that steps into an array isn't an index or `-` |

`NotAContainerError` and `InvalidIndexError` extend `TypeError`. They have
the `pointer`, the `location` where `pointerGet` stopped, and the `segment`
that it couldn't apply.
