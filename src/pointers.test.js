import { describe, expect, test } from "vitest";
import { InvalidPointerError, pointerAppend, pointerParse, pointerStringify } from "./index.js";

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

describe("pointerParse", () => {
  test.each(pointers)("%j is %j", (pointer, segments) => {
    expect(pointerParse(pointer)).to.eql(segments);
  });

  test.each(invalidPointers)("%j is invalid", (pointer) => {
    expect(() => pointerParse(pointer)).to.throw(InvalidPointerError);
  });
});

describe("pointerStringify", () => {
  test.each(pointers)("%j is %j", (pointer, segments) => {
    expect(pointerStringify(segments)).to.equal(pointer);
  });

  test("takes readonly segments", () => {
    expect(pointerStringify(Object.freeze(["foo", "a/b"]))).to.equal("/foo/a~1b");
  });
});

describe("pointerAppend", () => {
  test("adds a segment to the end of a pointer", () => {
    expect(pointerAppend("bar", "/foo")).to.equal("/foo/bar");
  });

  test("adds a segment to the empty pointer", () => {
    expect(pointerAppend("bar", "")).to.equal("/bar");
  });

  test("adds an empty segment", () => {
    expect(pointerAppend("", "/foo")).to.equal("/foo/");
  });

  test("escapes the segment", () => {
    expect(pointerAppend("b~a/r", "/foo")).to.equal("/foo/b~0a~1r");
  });
});
