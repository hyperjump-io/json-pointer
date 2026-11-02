import { describe, expect, test } from "vitest";
import { InvalidIndexError, InvalidPointerError, NotAContainerError, pointerGet } from "./index.js";

// The example from RFC 6901, section 5, plus some
const subject = {
  "foo": ["bar", "baz"],
  "": 0,
  "a/b": 1,
  "c%d": 2,
  "e^f": 3,
  "g|h": 4,
  "i\\j": 5,
  "k\"l": 6,
  " ": 7,
  "m~n": 8,
  "aaa": null,
  "bbb": { "-": { ccc: 13 } }
};

describe("pointerGet", () => {
  test.each([
    ["", subject],
    ["/foo", ["bar", "baz"]],
    ["/foo/0", "bar"],
    ["/", 0],
    ["/a~1b", 1],
    ["/c%d", 2],
    ["/e^f", 3],
    ["/g|h", 4],
    ["/i\\j", 5],
    ["/k\"l", 6],
    ["/ ", 7],
    ["/m~0n", 8],
    ["/aaa", null],
    ["/bbb/-", { ccc: 13 }],
    ["/bbb/-/ccc", 13]
  ])("%j is %j", (pointer, expected) => {
    expect(pointerGet(pointer, subject)).to.eql(expected);
  });

  test("returns the value in the subject, not a copy", () => {
    expect(pointerGet("/foo", subject)).to.equal(subject.foo);
  });

  describe("segments", () => {
    test("are a pointer", () => {
      expect(pointerGet(["foo", "0"], subject)).to.equal("bar");
    });

    test("are used as they are, without unescaping", () => {
      expect(pointerGet(["a/b"], subject)).to.equal(1);
      expect(pointerGet(["a~1b"], subject)).to.equal(undefined);
    });

    test("can be readonly", () => {
      expect(pointerGet(Object.freeze(["foo", "1"]), subject)).to.equal("baz");
    });
  });

  describe("a value that isn't there", () => {
    test.each([
      ["/zzz"],
      ["/foo/2"],
      ["/bbb/zzz"]
    ])("%j is undefined", (pointer) => {
      expect(pointerGet(pointer, subject)).to.equal(undefined);
    });

    test("throws when what it would be in isn't there", () => {
      expect(() => pointerGet("/zzz/0", subject)).to.throw(NotAContainerError);
    });

    test.each([
      ["a string", "/foo/0/0"],
      ["a number", "//0"],
      ["null", "/aaa/0"]
    ])("throws when what it would be in is %s", (_type, pointer) => {
      expect(() => pointerGet(pointer, subject)).to.throw(NotAContainerError);
    });
  });

  describe("only own properties", () => {
    test("not inherited ones", () => {
      expect(pointerGet("/toString", subject)).to.equal(undefined);
      expect(pointerGet("/__proto__", subject)).to.equal(undefined);
    });

    test("not an array's length, which isn't an index", () => {
      expect(() => pointerGet("/foo/length", subject)).to.throw(InvalidIndexError);
    });

    test("__proto__ when it's an own property, as JSON.parse makes it", () => {
      expect(pointerGet("/__proto__", JSON.parse(`{ "__proto__": 42 }`))).to.equal(42);
    });
  });

  describe("arrays", () => {
    const array = ["a", "b", "c"];

    test("- is never there", () => {
      expect(pointerGet("/-", array)).to.equal(undefined);
    });

    test("the largest index", () => {
      expect(pointerGet("/4294967294", array)).to.equal(undefined);
    });

    test.each([
      ["01"],
      ["00"],
      ["1x"],
      [" 1"],
      ["1 "],
      ["+1"],
      ["-1"],
      ["1.0"],
      ["1e0"],
      ["0x1"],
      [""],
      ["foo"],
      ["4294967295"],
      ["99999999999"]
    ])("%j isn't an index", (segment) => {
      expect(() => pointerGet([segment], array)).to.throw(InvalidIndexError);
    });
  });

  describe("an invalid pointer", () => {
    test("throws", () => {
      expect(() => pointerGet("foo", subject)).to.throw(InvalidPointerError);
    });
  });

  describe("given only a pointer", () => {
    test("returns a function that takes the subject", () => {
      const getFoo = pointerGet("/foo/0");
      expect(getFoo(subject)).to.equal("bar");
      expect(getFoo({ foo: ["baz"] })).to.equal("baz");
    });

    test("works with map", () => {
      const people = [{ name: "Ada" }, { name: "Grace" }];
      expect(people.map(pointerGet("/name"))).to.eql(["Ada", "Grace"]);
    });

    test("throws for an invalid pointer before there's a subject", () => {
      expect(() => pointerGet("foo")).to.throw(InvalidPointerError);
    });

    test("isn't what an undefined subject gives", () => {
      // @ts-expect-error
      expect(() => pointerGet("/foo", undefined)).to.throw(NotAContainerError);
    });
  });
});
