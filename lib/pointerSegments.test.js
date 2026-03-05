import { describe, expect, test } from "vitest";
import { pointerSegments } from "./index.js";


describe("JsonPointer", () => {
  describe("pointerSegments", () => {
    /** @type [string, string[]][] */
    const tests = [
      ["", []],
      ["/", [""]],
      ["/foo", ["foo"]],
      ["/foo/bar", ["foo", "bar"]],
      ["/foo/0", ["foo", "0"]],
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

    tests.forEach(([pointer, expected]) => {
      test(`${JSON.stringify(pointer)} => ${JSON.stringify(expected)}`, () => {
        expect([...pointerSegments(pointer)]).to.eql(expected);
      });
    });
  });

  describe("a pointer that doesn't start with '/'", () => {
    test("should throw an error", () => {
      expect(() => [...pointerSegments("foo")]).to.throw(Error, "Invalid JSON Pointer");
    });
  });

  describe("a pointer with an invalid escape sequence", () => {
    /** @type string[] */
    const tests = [
      "/~",
      "/~2",
      "/~a",
      "/a~",
      "/~~",
      "/~0~"
    ];

    tests.forEach((pointer) => {
      test(`${JSON.stringify(pointer)} should throw an error`, () => {
        expect(() => [...pointerSegments(pointer)]).to.throw(Error, "Invalid JSON Pointer");
      });
    });
  });
});
