import { describe, expect, test } from "vitest";
import { InvalidIndexError, InvalidPointerError, NotAContainerError, pointerGet } from "./index.js";

/**
 * @import { Json } from "./index.d.ts"
 */

describe("InvalidPointerError", () => {
  const error = thrown(() => pointerGet("foo", {}));

  test("is an Error", () => {
    expect(error).to.be.instanceOf(InvalidPointerError);
    expect(error).to.be.instanceOf(Error);
  });

  test("has the pointer", () => {
    expect(error).to.include({ pointer: "foo" });
  });

  test("message", () => {
    expect(error).to.have.property("message", "Invalid JSON Pointer: 'foo'");
  });
});

describe("NotAContainerError", () => {
  const error = thrown(() => pointerGet("/aaa/bbb/ccc", { aaa: {} }));

  test("is a TypeError", () => {
    expect(error).to.be.instanceOf(NotAContainerError);
    expect(error).to.be.instanceOf(TypeError);
  });

  test("has where it stopped", () => {
    expect(error).to.include({ pointer: "/aaa/bbb/ccc", location: "/aaa/bbb", segment: "ccc" });
  });

  test("has the segment unescaped and the location escaped", () => {
    const error = thrown(() => pointerGet("/a~1b/c~0d", { "a/b": 42 }));
    expect(error).to.include({ pointer: "/a~1b/c~0d", location: "/a~1b", segment: "c~d" });
  });

  test("has the pointer as a string when it's given segments", () => {
    const error = thrown(() => pointerGet(["a/b", "c"], { "a/b": 42 }));
    expect(error).to.include({ pointer: "/a~1b/c", location: "/a~1b", segment: "c" });
  });

  test.each([
    [undefined, "Value at '/aaa/bbb' is undefined and does not have property 'ccc'"],
    [null, "Value at '/aaa/bbb' is null and does not have property 'ccc'"],
    ["foo", "Value at '/aaa/bbb' is a string and does not have property 'ccc'"],
    [42, "Value at '/aaa/bbb' is a number and does not have property 'ccc'"],
    [true, "Value at '/aaa/bbb' is a boolean and does not have property 'ccc'"]
  ])("message for %j", (value, message) => {
    /** @type Json */
    const subject = value === undefined ? { aaa: {} } : { aaa: { bbb: value } };
    expect(() => pointerGet("/aaa/bbb/ccc", subject)).to.throw(message);
  });

  test("message at the root", () => {
    expect(() => pointerGet("/0", 42)).to.throw("Value at '' is a number and does not have property '0'");
  });
});

describe("InvalidIndexError", () => {
  const error = thrown(() => pointerGet("/languages/first", { languages: ["English"] }));

  test("is a TypeError", () => {
    expect(error).to.be.instanceOf(InvalidIndexError);
    expect(error).to.be.instanceOf(TypeError);
  });

  test("has where it stopped", () => {
    expect(error).to.include({ pointer: "/languages/first", location: "/languages", segment: "first" });
  });

  test("message", () => {
    expect(error).to.have.property("message", "Value at '/languages' is an array and 'first' isn't an index");
  });
});

/** @type (fn: () => unknown) => unknown */
const thrown = (fn) => {
  try {
    fn();
  } catch (error) {
    return error;
  }
  throw Error("Expected an error to be thrown");
};
