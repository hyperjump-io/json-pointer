# Pointers

A JSON Pointer is a list of segments. Each segment is a property name or
an array index, and each one is written with a `/` before it. Starting from
the whole document, each segment steps into the value it names.

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

The empty pointer `""` is the whole document. It's exported as `nil` to use
as the starting point for [building pointers](#building-pointers).

## Escaping

A `/` in a property name would read as the start of another segment, so
it's written as `~1`. That makes `~` special too, so a `~` in a property
name is written as `~0`. `append`, `parse`, and `stringify` escape and
unescape for you. You only see escapes in pointers written by hand.

## Building pointers

`append(segment, pointer)` escapes a segment and adds it to the end of a
pointer. The segment comes first, then the pointer it's added to.

```typescript
const foo = JsonPointer.append("foo", JsonPointer.nil); // "/foo"
const item = JsonPointer.append("0", foo); // "/foo/0"
JsonPointer.append("a/b", JsonPointer.nil); // "/a~1b"
```

## Segments

`parse(pointer)` splits a pointer into unescaped segments.
`stringify(segments)` escapes them back into a pointer.

```typescript
JsonPointer.parse("/foo/a~1b/0"); // ["foo", "a/b", "0"]
JsonPointer.parse(JsonPointer.nil); // []
JsonPointer.stringify(["foo", "a/b", "0"]); // "/foo/a~1b/0"
```

Segments are always strings, array indexes included.

Every function that takes a pointer also takes its segments. If you build
pointers from parts, keep them as segments. That way they're never escaped
and parsed again.

```typescript
JsonPointer.get(["foo", "0"], doc); // same as get("/foo/0", doc)
```

## Invalid pointers

A pointer is invalid if it isn't empty and doesn't start with `/`. It's
also invalid if it has a `~` that isn't followed by `0` or `1`. Every
function that takes a pointer throws an `InvalidPointerError` for an
invalid one. The curried form throws as soon as it's given the pointer.
The error's `pointer` property is the pointer. Segments are never invalid.

```typescript
JsonPointer.get("foo", doc); // throws: no leading "/"
JsonPointer.get("/a~b", doc); // throws: "~" must be "~0" or "~1"
```

## Pointers in URIs

A pointer is often a URI's fragment, like
`https://example.com/schema.json#/$defs/name`. RFC 6901 says that
characters that aren't allowed in a fragment, like spaces and `%`, are
percent-encoded in a URI. This package works with pointers, not URIs, so
decode a fragment before using it:

```typescript
const url = new URL("https://example.com/doc.json#/first%20name");
const pointer = decodeURIComponent(url.hash.slice(1)); // "/first name"
JsonPointer.get(pointer, doc);
```

When you put a pointer in a URI, percent-encode those characters.
