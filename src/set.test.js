import { describe, expect, test } from "vitest";
import * as JsonPointer from "./index.js";

/**
 * @import { Json, JsonObject } from "./index.d.ts"
 */

describe("set", () => {
  test("sets a property", () => {
    expect(JsonPointer.set("/aaa", { aaa: 111, bbb: 222 }, "foo")).to.eql({ aaa: "foo", bbb: 222 });
  });

  test("adds a property", () => {
    expect(JsonPointer.set("/bbb", { aaa: 111 }, "foo")).to.eql({ aaa: 111, bbb: "foo" });
  });

  test("sets a nested property", () => {
    const subject = { aaa: { ccc: 333, ddd: 444 }, bbb: 222 };
    expect(JsonPointer.set("/aaa/ccc", subject, "foo")).to.eql({ aaa: { ccc: "foo", ddd: 444 }, bbb: 222 });
  });

  test("sets a property whose name needs escaping", () => {
    expect(JsonPointer.set("/a~1b", {}, "foo")).to.eql({ "a/b": "foo" });
  });

  test("sets by segments", () => {
    expect(JsonPointer.set(["aaa", "a/b"], { aaa: {} }, "foo")).to.eql({ aaa: { "a/b": "foo" } });
  });

  test("with the nil pointer, returns the value", () => {
    const value = { foo: "bar" };
    expect(JsonPointer.set(JsonPointer.nil, { aaa: 111 }, value)).to.equal(value);
  });

  describe("copying", () => {
    const subject = deepFreeze({ aaa: { ccc: 333 }, bbb: { ddd: 444 } });
    const result = /** @type JsonObject */ (JsonPointer.set("/aaa/ccc", subject, "foo"));

    test("doesn't change the subject", () => {
      expect(subject).to.eql({ aaa: { ccc: 333 }, bbb: { ddd: 444 } });
    });

    test("copies what's on the way to the value", () => {
      expect(result).to.not.equal(subject);
      expect(result.aaa).to.not.equal(subject.aaa);
    });

    test("shares everything else", () => {
      expect(result.bbb).to.equal(subject.bbb);
    });

    test("copies arrays as arrays", () => {
      const result = JsonPointer.set("/0/1", deepFreeze([[111, 222], 333]), "foo");
      expect(result).to.eql([[111, "foo"], 333]);
      expect(Array.isArray(result)).to.equal(true);
    });
  });

  describe("arrays", () => {
    test("sets an item", () => {
      expect(JsonPointer.set("/0", [111, 222], "foo")).to.eql(["foo", 222]);
    });

    test("sets the item after the last", () => {
      expect(JsonPointer.set("/2", [111, 222], "foo")).to.eql([111, 222, "foo"]);
    });

    test("- adds an item to the end", () => {
      expect(JsonPointer.set("/-", [111, 222], "foo")).to.eql([111, 222, "foo"]);
    });

    test("- adds an item to an empty array", () => {
      expect(JsonPointer.set("/aaa/-", { aaa: [] }, "foo")).to.eql({ aaa: ["foo"] });
    });

    test("an index past the end leaves holes before it", () => {
      const result = /** @type Json[] */ (JsonPointer.set("/3", [111], "foo"));
      expect(result).to.have.length(4);
      expect(Object.keys(result)).to.eql(["0", "3"]);
    });

    test("throws for a segment that isn't an index or -", () => {
      expect(() => JsonPointer.set("/01", [111, 222], "foo")).to.throw(JsonPointer.InvalidIndexError);
      expect(() => JsonPointer.set("/foo", [111, 222], "foo")).to.throw(JsonPointer.InvalidIndexError);
    });

    test("throws for a segment that isn't an index or - on the way to the value", () => {
      expect(() => JsonPointer.set("/foo/0", [[111]], "foo")).to.throw(JsonPointer.InvalidIndexError);
    });
  });

  describe("__proto__", () => {
    const result = /** @type JsonObject */ (JsonPointer.set("/__proto__", {}, { polluted: true }));

    test("is set as an own property", () => {
      expect(Object.hasOwn(result, "__proto__")).to.equal(true);
      expect(JSON.stringify(result)).to.equal(`{"__proto__":{"polluted":true}}`);
    });

    test("doesn't change the prototype", () => {
      expect(Object.getPrototypeOf(result)).to.equal(Object.prototype);
      expect(result).to.not.have.property("polluted");
    });

    test("is copied when it's on the way to the value", () => {
      const subject = deepFreeze(JSON.parse(`{ "__proto__": { "aaa": 111 } }`));
      const result = /** @type JsonObject */ (JsonPointer.set("/__proto__/aaa", subject, "foo"));
      expect(JSON.stringify(result)).to.equal(`{"__proto__":{"aaa":"foo"}}`);
      expect(Object.getPrototypeOf(result)).to.equal(Object.prototype);
    });

    test("isn't there when it's inherited", () => {
      expect(() => JsonPointer.set("/__proto__/polluted", {}, true)).to.throw(JsonPointer.NotAContainerError);
      expect(Object.prototype).to.not.have.property("polluted");
    });
  });

  describe("what has to exist", () => {
    test("throws when what it would be set in isn't there", () => {
      expect(() => JsonPointer.set("/aaa/ccc/bbb", { aaa: { bbb: {} } }, "foo")).to.throw(JsonPointer.NotAContainerError);
    });

    test.each([
      ["a string", "foo"],
      ["a number", 42],
      ["a boolean", true],
      ["null", null]
    ])("throws when what it would be set in is %s", (_type, value) => {
      expect(() => JsonPointer.set("/0", value, "foo")).to.throw(JsonPointer.NotAContainerError);
    });

    test("doesn't find inherited properties on the way", () => {
      expect(() => JsonPointer.set("/toString/foo", {}, "foo")).to.throw(JsonPointer.NotAContainerError);
    });
  });

  describe("an invalid pointer", () => {
    test("throws", () => {
      expect(() => JsonPointer.set("foo", {}, "foo")).to.throw(JsonPointer.InvalidPointerError);
    });
  });

  describe("given only a pointer", () => {
    test("returns a function that takes the subject and the value", () => {
      const addItem = JsonPointer.set("/aaa/-");
      expect(addItem({ aaa: [111] }, 222)).to.eql({ aaa: [111, 222] });
      expect(addItem({ aaa: [] }, 333)).to.eql({ aaa: [333] });
    });

    test("throws for an invalid pointer before there's a subject", () => {
      expect(() => JsonPointer.set("foo")).to.throw(JsonPointer.InvalidPointerError);
    });

    test("isn't what a subject without a value gives, which sets undefined", () => {
      // @ts-expect-error
      const result = JsonPointer.set("/aaa", { bbb: 222 });
      expect(result).to.have.property("aaa", undefined);
    });
  });
});

/** @type <T>(value: T) => T */
const deepFreeze = (value) => {
  if (typeof value === "object" && value !== null) {
    for (const item of Object.values(value)) {
      deepFreeze(item);
    }
    Object.freeze(value);
  }
  return value;
};
