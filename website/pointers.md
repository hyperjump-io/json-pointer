# Pointers

A JSON Pointer is a list of segments. Each segment is a property name or
an array index, with a `/` before it. Starting from the whole document,
each segment steps into the value that it names.

For example, take the following document:

```json
{
  "foo": ["bar", "baz"],
  "": 0,
  "a/b": 1,
  "m~n": 2
}
```

The following table shows the value that each pointer identifies in it:

| Pointer | Value |
| --- | --- |
| `""` | The whole document |
| `/foo` | `["bar", "baz"]` |
| `/foo/0` | `"bar"` |
| `/` | `0`, the property whose name is the empty string |
| `/a~1b` | `1` |
| `/m~0n` | `2` |

The empty pointer `""` is the whole document. It's also the starting
point when you [build pointers](#build-pointers).

## Escape sequences

A `/` in a property name would read as the start of another segment, so you
write it as `~1`. That makes `~` special too, so you write a `~` in a
property name as `~0`. `pointerAppend`, `pointerParse`, and
`pointerStringify` escape and unescape for you. You see escapes only in
pointers that someone wrote by hand.

## Build pointers

`pointerAppend(segment, pointer)` escapes a segment and adds it to the end
of a pointer. The segment comes first, then the pointer to add it to:

```typescript
const foo = pointerAppend("foo", ""); // "/foo"
const item = pointerAppend("0", foo); // "/foo/0"
pointerAppend("a/b", ""); // "/a~1b"
```

## Segments

`pointerParse(pointer)` splits a pointer into unescaped segments.
`pointerStringify(segments)` escapes them back into a pointer:

```typescript
pointerParse("/foo/a~1b/0"); // ["foo", "a/b", "0"]
pointerParse(""); // []
pointerStringify(["foo", "a/b", "0"]); // "/foo/a~1b/0"
```

Segments are always strings, including array indexes.

Every function that takes a pointer also takes its segments. If you build
pointers from parts, keep them as segments. That way, the package never
has to escape them and parse them again:

```typescript
pointerGet(["foo", "0"], doc); // same as pointerGet("/foo/0", doc)
```

## Invalid pointers

A pointer is invalid if it isn't empty and doesn't start with `/`. It's
also invalid if it has a `~` without a `0` or `1` after it. Every function
that takes a pointer throws an `InvalidPointerError` for an invalid one.
The curried form throws when you give it the pointer. The error's
`pointer` property is the invalid pointer. Segments are never invalid.

For example, both of the following calls throw:

```typescript
pointerGet("foo", doc); // throws: no leading "/"
pointerGet("/a~b", doc); // throws: "~" must be "~0" or "~1"
```

## Pointers in URIs

A pointer is often a URI's fragment, like
`https://example.com/schema.json#/$defs/name`. RFC 6901 says to
percent-encode the characters that a fragment doesn't allow, like spaces
and `%`. This package works with pointers, not URIs, so decode a fragment
before you use it:

```typescript
const url = new URL("https://example.com/doc.json#/first%20name");
const pointer = decodeURIComponent(url.hash.slice(1)); // "/first name"
pointerGet(pointer, doc);
```

When you put a pointer in a URI, percent-encode those characters.
