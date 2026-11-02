import { describe, expect, test } from "vitest";
import { InvalidIndexError, InvalidPointerError, NotAContainerError, pointerUnset } from "./index.js";

/**
 * @import { Json, JsonObject } from "./index.d.ts"
 */

describe("pointerUnset", () => {
  test("removes a property", () => {
    expect(pointerUnset("/aaa", { aaa: 111, bbb: 222 })).to.eql({ bbb: 222 });
  });

  test("removes a nested property", () => {
    const subject = { aaa: { ccc: 333, ddd: 444 }, bbb: 222 };
    expect(pointerUnset("/aaa/ccc", subject)).to.eql({ aaa: { ddd: 444 }, bbb: 222 });
  });

  test("removes by segments", () => {
    expect(pointerUnset(["aaa", "a/b"], { aaa: { "a/b": 111 } })).to.eql({ aaa: {} });
  });

  test("with the empty pointer, returns undefined", () => {
    expect(pointerUnset("", { aaa: 111 })).to.equal(undefined);
  });

  describe("copying", () => {
    const subject = deepFreeze({ aaa: { ccc: 333 }, bbb: { ddd: 444 } });
    const result = /** @type JsonObject */ (pointerUnset("/aaa/ccc", subject));

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
  });

  describe("a value that isn't there", () => {
    test.each([
      ["/bbb"],
      ["/aaa/bbb"],
      ["/aaa/toString"],
      ["/ccc/5"],
      ["/ccc/-"]
    ])("%j returns the subject itself", (pointer) => {
      const subject = deepFreeze({ aaa: {}, ccc: [111] });
      expect(pointerUnset(pointer, subject)).to.equal(subject);
    });

    test("throws when what it would be removed from isn't there", () => {
      expect(() => pointerUnset("/aaa/ccc/bbb", { aaa: {} })).to.throw(NotAContainerError);
    });

    test.each([
      ["a string", "foo"],
      ["a number", 42],
      ["a boolean", true],
      ["null", null]
    ])("throws when what it would be removed from is %s", (_type, value) => {
      expect(() => pointerUnset("/0", value)).to.throw(NotAContainerError);
    });
  });

  describe("arrays", () => {
    test("removing an item leaves a hole", () => {
      const result = /** @type Json[] */ (pointerUnset("/0", deepFreeze([111, 222])));
      expect(result).to.have.length(2);
      expect(Object.keys(result)).to.eql(["1"]);
      expect(JSON.stringify(result)).to.equal("[null,222]");
    });

    test("copies arrays as arrays", () => {
      const result = pointerUnset("/0/1", deepFreeze([[111, 222], 333]));
      expect(Array.isArray(result)).to.equal(true);
      expect(Array.isArray(/** @type Json[] */ (result)[0])).to.equal(true);
    });

    test("throws for a segment that isn't an index or -", () => {
      expect(() => pointerUnset("/01", [111, 222])).to.throw(InvalidIndexError);
      expect(() => pointerUnset("/foo", [111, 222])).to.throw(InvalidIndexError);
    });
  });

  describe("__proto__", () => {
    test("removes it when it's an own property", () => {
      const subject = deepFreeze(JSON.parse(`{ "__proto__": 111, "aaa": 222 }`));
      const result = /** @type JsonObject */ (pointerUnset("/__proto__", subject));
      expect(Object.hasOwn(result, "__proto__")).to.equal(false);
      expect(Object.getPrototypeOf(result)).to.equal(Object.prototype);
      expect(result).to.eql({ aaa: 222 });
    });

    test("isn't there when it's inherited", () => {
      const subject = { aaa: 111 };
      expect(pointerUnset("/__proto__", subject)).to.equal(subject);
    });
  });

  describe("an invalid pointer", () => {
    test("throws", () => {
      expect(() => pointerUnset("foo", {})).to.throw(InvalidPointerError);
    });
  });

  describe("given only a pointer", () => {
    test("returns a function that takes the subject", () => {
      const unsetName = pointerUnset("/name");
      expect(unsetName({ name: "Ada", age: 36 })).to.eql({ age: 36 });
      expect(unsetName({ name: "Grace" })).to.eql({});
    });

    test("throws for an invalid pointer before there's a subject", () => {
      expect(() => pointerUnset("foo")).to.throw(InvalidPointerError);
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
