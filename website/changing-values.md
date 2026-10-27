# Changing values

There are two ways to change a value by pointer: return a new value and
leave the original alone, or change the original in place.

| | Returns a new value | Changes the value in place |
| --- | --- | --- |
| Set a value | `set(pointer, subject, value)` | `assign(pointer, subject, value)` |
| Remove a value | `unset(pointer, subject)` | `remove(pointer, subject)` |

## Setting a value

`set` returns a new value with the value set. `subject` isn't changed.

```javascript
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

```javascript
moved === doc; // false
moved.address === doc.address; // false
moved.languages === doc.languages; // true
```

That makes `set` cheap, even for large documents. It also means that to
keep `subject` unchanged, you change the new value with `set` too, and not
in place.

`assign` sets the value in place, and returns nothing.

```javascript
JsonPointer.assign("/address/city", doc, "Paris");
doc.address.city; // "Paris"
```

Both add the property if it isn't there. The object or array it's added to
has to exist, though. Neither creates the objects on the way, so
`/phone/home` throws if there's no `/phone`.

## Removing a value

`unset` returns a new value without the value. Like `set`, it copies only
what's on the way to the value, and `subject` isn't changed.

```javascript
const unlisted = JsonPointer.unset("/address", doc);
"address" in unlisted; // false
"address" in doc; // true
```

`remove` removes the value in place, and returns nothing.

```javascript
JsonPointer.remove("/address", doc);
"address" in doc; // false
```

If the value isn't there, nothing is removed. If what it would be removed
from isn't there, they throw, like `get` does.

## Arrays

A segment that steps into an array is an index, and setting it replaces
that item. The segment `-` is the position after the last item, so setting
it adds an item to the end.

```javascript
const more = JsonPointer.set("/languages/-", doc, "Greek");
more.languages; // ["English", "French", "Greek"]
```

Use `-` to add items. Setting an index past the end leaves empty slots
before it.

Removing an item doesn't move the items after it, so the array keeps its
length and has an empty slot where the item was. `JSON.stringify` writes
an empty slot as `null`.

```javascript
const fewer = JsonPointer.unset("/languages/0", doc);
fewer.languages.length; // 2
JSON.stringify(fewer.languages); // '[null,"French"]'
```

To take an item out and move the rest up, set the array to one without it:

```javascript
const languages = JsonPointer.get("/languages", doc);
const shifted = JsonPointer.set(
  "/languages",
  doc,
  languages.toSpliced(0, 1)
);
shifted.languages; // ["French"]
```

## The whole document

The empty pointer, `""`, is the whole document. `set` returns `value`, and
`unset` returns `undefined`. A value can't replace itself in place, so
`assign` and `remove` do nothing with it.

## Applying a pointer many times

Like `get`, each function takes just a pointer and returns a function that
takes the rest of the arguments. The pointer is parsed once, the first time
the function is used.

```javascript
const addLanguage = JsonPointer.set("/languages/-");

const ada = { languages: ["English"] };
addLanguage(ada, "French").languages; // ["English", "French"]
```

## Errors

| Error | When |
| --- | --- |
| `Error` with the message `Invalid JSON Pointer` | The pointer isn't valid (see [Invalid pointers](pointers.md#invalid-pointers)). With just a pointer, it's thrown when the function that's returned is used. |
| `TypeError` | A segment before the last doesn't lead to an object or an array. The message says where it stopped, like `get`'s (see [When a value isn't there](getting-values.md#when-a-value-isnt-there)). |
