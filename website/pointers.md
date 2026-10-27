# Pointers

A JSON Pointer is a list of segments, each one a property name or an array
index, written with a `/` before each. Starting from the whole document,
each segment steps into the value it names.

```json
{
  "foo": ["bar", "baz"],
  "": 0,
  "a/b": 1,
  "m~n": 2
}
```

| Pointer | Value |
| --- | --- |
| `""` | The whole document |
| `/foo` | `["bar", "baz"]` |
| `/foo/0` | `"bar"` |
| `/` | `0`, the property whose name is the empty string |
| `/a~1b` | `1` |
| `/m~0n` | `2` |

The empty pointer, `""`, is the whole document. It's exported as `nil`, as
the starting point for [building pointers](#building-pointers).

## Escaping

A `/` in a property name would read as the start of another segment, so
it's written `~1`. That makes `~` special too, so a `~` in a property name
is written `~0`. `append` and `pointerSegments` escape and unescape for
you, so you only see escapes in pointers written by hand.

## Building pointers

`append(segment, pointer)` adds a segment to the end of a pointer, escaping
it. The segment comes first, then the pointer it's added to.

```typescript
const foo = JsonPointer.append("foo", JsonPointer.nil); // "/foo"
const item = JsonPointer.append("0", foo); // "/foo/0"
JsonPointer.append("a/b", JsonPointer.nil); // "/a~1b"
```

To build a pointer from a list of segments, start from `nil`:

```typescript
const pointer = ["foo", "a/b", "0"].reduce(
  (pointer, segment) => JsonPointer.append(segment, pointer),
  JsonPointer.nil
);
pointer; // "/foo/a~1b/0"
```

## Reading segments

`pointerSegments(pointer)` iterates over a pointer's segments, unescaped.

```typescript
[...JsonPointer.pointerSegments("/foo/a~1b/0")]; // ["foo", "a/b", "0"]
[...JsonPointer.pointerSegments(JsonPointer.nil)]; // []
```

Segments are always strings, array indexes included.

## Invalid pointers

A pointer is invalid if it isn't empty and doesn't start with `/`, or if it
has a `~` that isn't followed by `0` or `1`. Every function that takes a
pointer throws an `Error` with the message `Invalid JSON Pointer` for one.
`pointerSegments` throws when you start iterating.

```typescript
JsonPointer.get("foo", doc); // throws: no leading "/"
JsonPointer.get("/a~b", doc); // throws: "~" must be "~0" or "~1"
```

## Pointers in URIs

A pointer is often a URI's fragment, like
`https://example.com/schema.json#/$defs/name`. In a URI, characters that
aren't allowed in a fragment, like spaces and `%`, are percent-encoded, as
RFC 6901 describes. This package works with pointers, not URIs, so decode a
fragment before using it:

```typescript
const url = new URL("https://example.com/doc.json#/first%20name");
const pointer = decodeURIComponent(url.hash.slice(1)); // "/first name"
JsonPointer.get(pointer, doc);
```

When you put a pointer in a URI, percent-encode those characters.
