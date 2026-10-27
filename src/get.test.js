import { describe, expect, test } from "vitest";
import * as JsonPointer from "./index.js";

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

describe("get", () => {
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
    expect(JsonPointer.get(pointer, subject)).to.eql(expected);
  });

  test("returns the value in the subject, not a copy", () => {
    expect(JsonPointer.get("/foo", subject)).to.equal(subject.foo);
  });

  describe("segments", () => {
    test("are a pointer", () => {
      expect(JsonPointer.get(["foo", "0"], subject)).to.equal("bar");
    });

    test("are used as they are, without unescaping", () => {
      expect(JsonPointer.get(["a/b"], subject)).to.equal(1);
      expect(JsonPointer.get(["a~1b"], subject)).to.equal(undefined);
    });

    test("can be readonly", () => {
      expect(JsonPointer.get(Object.freeze(["foo", "1"]), subject)).to.equal("baz");
    });
  });

  describe("a value that isn't there", () => {
    test.each([
      ["/zzz"],
      ["/foo/2"],
      ["/bbb/zzz"]
    ])("%j is undefined", (pointer) => {
      expect(JsonPointer.get(pointer, subject)).to.equal(undefined);
    });

    test("throws when what it would be in isn't there", () => {
      expect(() => JsonPointer.get("/zzz/0", subject)).to.throw(JsonPointer.NotAContainerError);
    });

    test.each([
      ["a string", "/foo/0/0"],
      ["a number", "//0"],
      ["null", "/aaa/0"]
    ])("throws when what it would be in is %s", (_type, pointer) => {
      expect(() => JsonPointer.get(pointer, subject)).to.throw(JsonPointer.NotAContainerError);
    });
  });

  describe("only own enumerable properties", () => {
    test("not inherited ones", () => {
      expect(JsonPointer.get("/toString", subject)).to.equal(undefined);
      expect(JsonPointer.get("/__proto__", subject)).to.equal(undefined);
    });

    test("not an array's length, which isn't an index", () => {
      expect(() => JsonPointer.get("/foo/length", subject)).to.throw(JsonPointer.InvalidIndexError);
    });

    test("not ones that aren't enumerable", () => {
      const hidden = Object.defineProperty({}, "foo", { value: 42, enumerable: false });
      expect(JsonPointer.get("/foo", hidden)).to.equal(undefined);
    });

    test("__proto__ when it's an own property, as JSON.parse makes it", () => {
      expect(JsonPointer.get("/__proto__", JSON.parse(`{ "__proto__": 42 }`))).to.equal(42);
    });
  });

  describe("arrays", () => {
    const array = ["a", "b", "c"];

    test("- is never there", () => {
      expect(JsonPointer.get("/-", array)).to.equal(undefined);
    });

    test("the largest index", () => {
      expect(JsonPointer.get("/4294967294", array)).to.equal(undefined);
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
      expect(() => JsonPointer.get([segment], array)).to.throw(JsonPointer.InvalidIndexError);
    });
  });

  describe("an invalid pointer", () => {
    test("throws", () => {
      expect(() => JsonPointer.get("foo", subject)).to.throw(JsonPointer.InvalidPointerError);
    });
  });

  describe("given only a pointer", () => {
    test("returns a function that takes the subject", () => {
      const getFoo = JsonPointer.get("/foo/0");
      expect(getFoo(subject)).to.equal("bar");
      expect(getFoo({ foo: ["baz"] })).to.equal("baz");
    });

    test("works with map", () => {
      const people = [{ name: "Ada" }, { name: "Grace" }];
      expect(people.map(JsonPointer.get("/name"))).to.eql(["Ada", "Grace"]);
    });

    test("throws for an invalid pointer before there's a subject", () => {
      expect(() => JsonPointer.get("foo")).to.throw(JsonPointer.InvalidPointerError);
    });

    test("isn't what an undefined subject gives", () => {
      // @ts-expect-error
      expect(() => JsonPointer.get("/foo", undefined)).to.throw(JsonPointer.NotAContainerError);
    });
  });
});
