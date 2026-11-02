import { describe, expect, test } from "vitest";
import { InvalidIndexError, InvalidPointerError, NotAContainerError, pointerSet } from "./index.js";

/**
 * @import { Json, JsonObject } from "./index.d.ts"
 */

describe("pointerSet", () => {
  test("sets a property", () => {
    expect(pointerSet("/aaa", { aaa: 111, bbb: 222 }, "foo")).to.eql({ aaa: "foo", bbb: 222 });
  });

  test("adds a property", () => {
    expect(pointerSet("/bbb", { aaa: 111 }, "foo")).to.eql({ aaa: 111, bbb: "foo" });
  });

  test("sets a nested property", () => {
    const subject = { aaa: { ccc: 333, ddd: 444 }, bbb: 222 };
    expect(pointerSet("/aaa/ccc", subject, "foo")).to.eql({ aaa: { ccc: "foo", ddd: 444 }, bbb: 222 });
  });

  test("sets a property whose name needs escaping", () => {
    expect(pointerSet("/a~1b", {}, "foo")).to.eql({ "a/b": "foo" });
  });

  test("sets by segments", () => {
    expect(pointerSet(["aaa", "a/b"], { aaa: {} }, "foo")).to.eql({ aaa: { "a/b": "foo" } });
  });

  test("with the empty pointer, returns the value", () => {
    const value = { foo: "bar" };
    expect(pointerSet("", { aaa: 111 }, value)).to.equal(value);
  });

  describe("copying", () => {
    const subject = deepFreeze({ aaa: { ccc: 333 }, bbb: { ddd: 444 } });
    const result = /** @type JsonObject */ (pointerSet("/aaa/ccc", subject, "foo"));

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
      const result = pointerSet("/0/1", deepFreeze([[111, 222], 333]), "foo");
      expect(result).to.eql([[111, "foo"], 333]);
      expect(Array.isArray(result)).to.equal(true);
    });
  });

  describe("arrays", () => {
    test("sets an item", () => {
      expect(pointerSet("/0", [111, 222], "foo")).to.eql(["foo", 222]);
    });

    test("sets the item after the last", () => {
      expect(pointerSet("/2", [111, 222], "foo")).to.eql([111, 222, "foo"]);
    });

    test("- adds an item to the end", () => {
      expect(pointerSet("/-", [111, 222], "foo")).to.eql([111, 222, "foo"]);
    });

    test("- adds an item to an empty array", () => {
      expect(pointerSet("/aaa/-", { aaa: [] }, "foo")).to.eql({ aaa: ["foo"] });
    });

    test("an index past the end leaves holes before it", () => {
      const result = /** @type Json[] */ (pointerSet("/3", [111], "foo"));
      expect(result).to.have.length(4);
      expect(Object.keys(result)).to.eql(["0", "3"]);
    });

    test("throws for a segment that isn't an index or -", () => {
      expect(() => pointerSet("/01", [111, 222], "foo")).to.throw(InvalidIndexError);
      expect(() => pointerSet("/foo", [111, 222], "foo")).to.throw(InvalidIndexError);
    });

    test("throws for a segment that isn't an index or - on the way to the value", () => {
      expect(() => pointerSet("/foo/0", [[111]], "foo")).to.throw(InvalidIndexError);
    });
  });

  describe("__proto__", () => {
    const result = /** @type JsonObject */ (pointerSet("/__proto__", {}, { polluted: true }));

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
      const result = /** @type JsonObject */ (pointerSet("/__proto__/aaa", subject, "foo"));
      expect(JSON.stringify(result)).to.equal(`{"__proto__":{"aaa":"foo"}}`);
      expect(Object.getPrototypeOf(result)).to.equal(Object.prototype);
    });

    test("isn't there when it's inherited", () => {
      expect(() => pointerSet("/__proto__/polluted", {}, true)).to.throw(NotAContainerError);
      expect(Object.prototype).to.not.have.property("polluted");
    });
  });

  describe("what has to exist", () => {
    test("throws when what it would be set in isn't there", () => {
      expect(() => pointerSet("/aaa/ccc/bbb", { aaa: { bbb: {} } }, "foo")).to.throw(NotAContainerError);
    });

    test.each([
      ["a string", "foo"],
      ["a number", 42],
      ["a boolean", true],
      ["null", null]
    ])("throws when what it would be set in is %s", (_type, value) => {
      expect(() => pointerSet("/0", value, "foo")).to.throw(NotAContainerError);
    });

    test("doesn't find inherited properties on the way", () => {
      expect(() => pointerSet("/toString/foo", {}, "foo")).to.throw(NotAContainerError);
    });
  });

  describe("an invalid pointer", () => {
    test("throws", () => {
      expect(() => pointerSet("foo", {}, "foo")).to.throw(InvalidPointerError);
    });
  });

  describe("given only a pointer", () => {
    test("returns a function that takes the subject and the value", () => {
      const addItem = pointerSet("/aaa/-");
      expect(addItem({ aaa: [111] }, 222)).to.eql({ aaa: [111, 222] });
      expect(addItem({ aaa: [] }, 333)).to.eql({ aaa: [333] });
    });

    test("throws for an invalid pointer before there's a subject", () => {
      expect(() => pointerSet("foo")).to.throw(InvalidPointerError);
    });

    test("isn't what a subject without a value gives, which sets undefined", () => {
      // @ts-expect-error
      const result = pointerSet("/aaa", { bbb: 222 });
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
