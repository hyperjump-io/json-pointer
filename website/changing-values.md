# Changing values

There are two ways to change a value by pointer. You can return a new value
and leave the original alone, or you can change the original in place.

| | Returns a new value | Changes the value in place |
| --- | --- | --- |
| Set a value | `set(pointer, subject, value)` | `assign(pointer, subject, value)` |
| Remove a value | `unset(pointer, subject)` | `remove(pointer, subject)` |

## Setting a value

`set` returns a new value with the value set. `subject` isn't changed.

```typescript
const doc = {
  name: "Ada",
  address: { city: "London" },
  languages: ["English", "French"]
};

const moved = JsonPointer.set("/address/city", doc, "Paris");
moved.address.city; // "Paris"
doc.address.city; // "London"
```

Only the objects and arrays on the way to the value are copied. Everything
else is shared with `subject`:

```typescript
moved === doc; // false
moved.address === doc.address; // false
moved.languages === doc.languages; // true
```

That makes `set` cheap, even for large documents. It also means you should
change the new value with `set` too, not in place. Otherwise you might
change `subject` through a shared part.

`assign` sets the value in place and returns nothing.

```typescript
JsonPointer.assign("/address/city", doc, "Paris");
doc.address.city; // "Paris"
```

Both add the property if it isn't there. But the object or array it's
added to has to exist. Neither one creates the objects along the way, so
`/phone/home` throws if there's no `/phone`.

## Removing a value

`unset` returns a new value with the value removed. Like `set`, it only
copies what's on the way to the value. `subject` isn't changed.

```typescript
const unlisted = JsonPointer.unset("/address", doc);
"address" in unlisted; // false
"address" in doc; // true
```

`remove` removes the value in place and returns nothing.

```typescript
JsonPointer.remove("/address", doc);
"address" in doc; // false
```

If the value isn't there, nothing is removed and `unset` returns `subject`
itself. If the object or array it would be removed from isn't there, both
functions throw, just like `get` does.

## Arrays

A segment that steps into an array is an index. Setting it replaces that
item. The segment `-` is the position after the last item, so setting it
adds an item to the end.

```typescript
const more = JsonPointer.set("/languages/-", doc, "Greek");
more.languages; // ["English", "French", "Greek"]
```

Use `-` to add items. Setting an index past the end leaves empty slots
before it. A segment that isn't an index or `-` throws, because an array in
JSON can only have items. `/languages/first` is an example.

Removing an item doesn't move the items after it. The array keeps its
length and has an empty slot where the item was. `JSON.stringify` writes an
empty slot as `null`.

```typescript
const fewer = JsonPointer.unset("/languages/0", doc);
fewer.languages.length; // 2
JSON.stringify(fewer.languages); // '[null,"French"]'
```

To take an item out and shift the rest down, set the array to a copy
without the item:

```typescript
const languages = JsonPointer.get("/languages", doc) as string[];
const shifted = JsonPointer.set(
  "/languages",
  doc,
  languages.toSpliced(0, 1)
);
shifted.languages; // ["French"]
```

## The whole document

The empty pointer `""` is the whole document. With it, `set` returns
`value` and `unset` returns `undefined`. A value can't replace itself in
place, so `assign` and `remove` do nothing with the empty pointer.

## TypeScript

`set` and `unset` return a value with `subject`'s type. A pointer is just a
string, so TypeScript can't know what it points to. The result is typed as
though `value` has the same type as what it replaces. If it doesn't, cast
the result. `get` returns a `Json`, so cast what it returns too, like
`languages` above.

With the empty pointer, `set` returns `value`'s type and `unset` returns
`undefined`.

## Applying a pointer many times

Like `get`, each function can take just a pointer. It returns a function
that takes the rest of the arguments. The pointer is parsed once, when you
first pass it in.

```typescript
const addLanguage = JsonPointer.set("/languages/-");

const ada = { languages: ["English"] };
addLanguage(ada, "French").languages; // ["English", "French"]
```

## Errors

| Error | When |
| --- | --- |
| `InvalidPointerError` | The pointer isn't valid. See [Invalid pointers](pointers.md#invalid-pointers). If you pass just a pointer, it's thrown right away, before there's a subject. |
| `NotAContainerError` | A segment before the last doesn't lead to an object or an array. Like `get`'s error, it says where it stopped. See [Errors](getting-values.md#errors). |
| `InvalidIndexError` | A segment that steps into an array isn't an index or `-` |
