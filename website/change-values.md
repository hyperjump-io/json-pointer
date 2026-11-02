# Change values

You can change a value by pointer in two ways. You can return a new value
and leave the original alone, or you can change the original in place. The
following table shows the function for each:

| Change | Returns a new value | Changes the value in place |
| --- | --- | --- |
| Set a value | `pointerSet(pointer, subject, value)` | `pointerAssign(pointer, subject, value)` |
| Remove a value | `pointerUnset(pointer, subject)` | `pointerRemove(pointer, subject)` |

## Set a value

`pointerSet` returns a new value with the value set, and doesn't change
`subject`:

```typescript
const doc = {
  name: "Ada",
  address: { city: "London" },
  languages: ["English", "French"]
};

const moved = pointerSet("/address/city", doc, "Paris");
moved.address.city; // "Paris"
doc.address.city; // "London"
```

`pointerSet` copies only the objects and arrays on the way to the value.
The new value shares everything else with `subject`:

```typescript
moved === doc; // false
moved.address === doc.address; // false
moved.languages === doc.languages; // true
```

That makes `pointerSet` cheap, even for large documents. It also means that
you should change the new value with `pointerSet` too, not in place.
Otherwise, you might change `subject` through a shared part.

`pointerAssign` sets the value in place and returns nothing:

```typescript
pointerAssign("/address/city", doc, "Paris");
doc.address.city; // "Paris"
```

Both functions add the property if it isn't there, but the object or array
that holds it has to exist. Neither one creates the objects along the way,
so `/phone/home` throws if there's no `/phone`.

## Remove a value

`pointerUnset` returns a new value with the value removed, and doesn't
change `subject`. Like `pointerSet`, it copies only what's on the way to
the value:

```typescript
const unlisted = pointerUnset("/address", doc);
"address" in unlisted; // false
"address" in doc; // true
```

`pointerRemove` removes the value in place and returns nothing:

```typescript
pointerRemove("/address", doc);
"address" in doc; // false
```

If the value isn't there, `pointerUnset` returns `subject` itself, and
`pointerRemove` does nothing. If the object or array that would hold the
value isn't there, both functions throw, like `pointerGet` does.

## Arrays

A segment that steps into an array is an index, and setting it replaces
that item. The segment `-` is the position after the last item, so setting
it adds an item to the end:

```typescript
const more = pointerSet("/languages/-", doc, "Greek");
more.languages; // ["English", "French", "Greek"]
```

Use `-` to add items. If you set an index past the end, the array gets
empty slots before it. A segment that isn't an index or `-`, like
`/languages/first`, throws, because an array in JSON can have only items.

Removing an item doesn't move the items after it. The array keeps its
length, with an empty slot where the item was. `JSON.stringify` writes an
empty slot as `null`:

```typescript
const fewer = pointerUnset("/languages/0", doc);
fewer.languages.length; // 2
JSON.stringify(fewer.languages); // '[null,"French"]'
```

To take an item out and shift the rest down, set the array to a copy
without the item:

```typescript
const languages = pointerGet("/languages", doc) as string[];
const shifted = pointerSet(
  "/languages",
  doc,
  languages.toSpliced(0, 1)
);
shifted.languages; // ["French"]
```

## The whole document

The empty pointer `""` is the whole document. With it, `pointerSet` returns
`value`, and `pointerUnset` returns `undefined`. A value can't replace
itself in place, so `pointerAssign` and `pointerRemove` do nothing with the
empty pointer.

## TypeScript

`pointerSet` and `pointerUnset` return a value with `subject`'s type. A
pointer is only a string, so TypeScript can't know what it points to. The
return type assumes that `value` has the same type as what it replaces. If
it doesn't, cast the result. `pointerGet` returns a `Json`, so cast what it
returns too, like `languages` in the last example in [Arrays](#arrays).

With the empty pointer, `pointerSet` returns `value`'s type, and
`pointerUnset` returns `undefined`.

## Apply a pointer many times

Like `pointerGet`, each function can take only a pointer. It returns a
function that takes the rest of the arguments, and parses the pointer once,
when you first pass it in:

```typescript
const addLanguage = pointerSet("/languages/-");

const ada = { languages: ["English"] };
addLanguage(ada, "French").languages; // ["English", "French"]
```

## Errors

These functions throw the following errors:

| Error | When |
| --- | --- |
| `InvalidPointerError` | The pointer isn't valid. If you pass only a pointer, the function throws it right away, before there's a subject. For more information, see [Invalid pointers](pointers.md#invalid-pointers). |
| `NotAContainerError` | A segment before the last doesn't lead to an object or an array. Like the error from `pointerGet`, it says where the function stopped. For more information, see [Errors](get-values.md#errors) in Get values. |
| `InvalidIndexError` | A segment that steps into an array isn't an index or `-` |
