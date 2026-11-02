import { describe, expect, test } from "vitest";
import { InvalidIndexError, InvalidPointerError, NotAContainerError, pointerRemove } from "./index.js";

/**
 * @import { Json, JsonObject } from "./index.d.ts"
 */

describe("pointerRemove", () => {
  test("removes a property in place", () => {
    const subject = { aaa: 111, bbb: 222 };
    pointerRemove("/aaa", subject);
    expect(subject).to.eql({ bbb: 222 });
  });

  test("removes a nested property", () => {
    const aaa = { ccc: 333, ddd: 444 };
    const subject = { aaa };
    pointerRemove("/aaa/ccc", subject);
    expect(subject).to.eql({ aaa: { ddd: 444 } });
    expect(subject.aaa).to.equal(aaa);
  });

  test("removes by segments", () => {
    const subject = { aaa: { "a/b": 111 } };
    pointerRemove(["aaa", "a/b"], subject);
    expect(subject).to.eql({ aaa: {} });
  });

  test("returns nothing", () => {
    expect(pointerRemove("/aaa", { aaa: 111 })).to.equal(undefined);
  });

  test("with the empty pointer, does nothing", () => {
    const subject = { aaa: 111 };
    pointerRemove("", subject);
    expect(subject).to.eql({ aaa: 111 });
  });

  describe("a value that isn't there", () => {
    test.each([
      ["/bbb"],
      ["/aaa/bbb"],
      ["/ccc/5"],
      ["/ccc/-"]
    ])("%j removes nothing", (pointer) => {
      const subject = { aaa: {}, ccc: [111] };
      pointerRemove(pointer, subject);
      expect(subject).to.eql({ aaa: {}, ccc: [111] });
    });

    test("doesn't remove inherited properties", () => {
      const subject = { aaa: {} };
      pointerRemove("/aaa/toString", subject);
      expect(subject.aaa).to.have.property("toString");
    });

    test("throws when what it would be removed from isn't there", () => {
      expect(() => pointerRemove("/aaa/ccc/bbb", { aaa: {} })).to.throw(NotAContainerError);
    });

    test.each([
      ["a string", "foo"],
      ["a number", 42],
      ["a boolean", true],
      ["null", null]
    ])("throws when what it would be removed from is %s", (_type, value) => {
      expect(() => pointerRemove("/0", value)).to.throw(NotAContainerError);
    });
  });

  describe("arrays", () => {
    test("removing an item leaves a hole", () => {
      /** @type Json[] */
      const subject = [111, 222];
      pointerRemove("/0", subject);
      expect(subject).to.have.length(2);
      expect(Object.keys(subject)).to.eql(["1"]);
    });

    test("throws for a segment that isn't an index or -", () => {
      expect(() => pointerRemove("/01", [111, 222])).to.throw(InvalidIndexError);
      expect(() => pointerRemove("/foo", [111, 222])).to.throw(InvalidIndexError);
    });
  });

  describe("__proto__", () => {
    test("removes it when it's an own property", () => {
      const subject = /** @type JsonObject */ (JSON.parse(`{ "__proto__": 111, "aaa": 222 }`));
      pointerRemove("/__proto__", subject);
      expect(Object.hasOwn(subject, "__proto__")).to.equal(false);
      expect(Object.getPrototypeOf(subject)).to.equal(Object.prototype);
    });

    test("isn't there when it's inherited", () => {
      const subject = {};
      pointerRemove("/__proto__", subject);
      expect(Object.getPrototypeOf(subject)).to.equal(Object.prototype);
    });
  });

  describe("an invalid pointer", () => {
    test("throws", () => {
      expect(() => pointerRemove("foo", {})).to.throw(InvalidPointerError);
    });
  });

  describe("given only a pointer", () => {
    test("returns a function that takes the subject", () => {
      const removeName = pointerRemove("/name");
      const ada = { name: "Ada", age: 36 };
      removeName(ada);
      expect(ada).to.eql({ age: 36 });
    });

    test("throws for an invalid pointer before there's a subject", () => {
      expect(() => pointerRemove("foo")).to.throw(InvalidPointerError);
    });
  });
});
