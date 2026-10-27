import { describe, expect, test } from "vitest";
import * as JsonPointer from "./index.js";

/** @type [string, string[]][] */
const pointers = [
  ["", []],
  ["/", [""]],
  ["/foo", ["foo"]],
  ["/foo/bar", ["foo", "bar"]],
  ["/foo/0", ["foo", "0"]],
  ["//", ["", ""]],
  ["/a~1b", ["a/b"]],
  ["/m~0n", ["m~n"]],
  ["/~00", ["~0"]],
  ["/~01", ["~1"]],
  ["/~10", ["/0"]],
  ["/~11", ["/1"]],
  ["/~01~10", ["~1/0"]],
  ["/~00/~11", ["~0", "/1"]],
  ["/ ", [" "]],
  ["/c%d", ["c%d"]],
  ["/e^f", ["e^f"]],
  ["/g|h", ["g|h"]],
  ["/i\\j", ["i\\j"]],
  ["/k\"l", ["k\"l"]]
];

const invalidPointers = [
  "foo",
  "#/foo",
  "/~",
  "/~2",
  "/~a",
  "/a~",
  "/~~",
  "/~0~"
];

describe("nil", () => {
  test("is the empty pointer", () => {
    expect(JsonPointer.nil).to.equal("");
  });
});

describe("parse", () => {
  test.each(pointers)("%j is %j", (pointer, segments) => {
    expect(JsonPointer.parse(pointer)).to.eql(segments);
  });

  test.each(invalidPointers)("%j is invalid", (pointer) => {
    expect(() => JsonPointer.parse(pointer)).to.throw(JsonPointer.InvalidPointerError);
  });
});

describe("stringify", () => {
  test.each(pointers)("%j is %j", (pointer, segments) => {
    expect(JsonPointer.stringify(segments)).to.equal(pointer);
  });

  test("takes readonly segments", () => {
    expect(JsonPointer.stringify(Object.freeze(["foo", "a/b"]))).to.equal("/foo/a~1b");
  });
});

describe("append", () => {
  test("adds a segment to the end of a pointer", () => {
    expect(JsonPointer.append("bar", "/foo")).to.equal("/foo/bar");
  });

  test("adds a segment to the nil pointer", () => {
    expect(JsonPointer.append("bar", JsonPointer.nil)).to.equal("/bar");
  });

  test("adds an empty segment", () => {
    expect(JsonPointer.append("", "/foo")).to.equal("/foo/");
  });

  test("escapes the segment", () => {
    expect(JsonPointer.append("b~a/r", "/foo")).to.equal("/foo/b~0a~1r");
  });
});
