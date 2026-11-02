import { describe, expect, test } from "vitest";
import { InvalidIndexError, InvalidPointerError, NotAContainerError, pointerAssign } from "./index.js";

/**
 * @import { Json, JsonObject } from "./index.d.ts"
 */

describe("pointerAssign", () => {
  test("sets a property in place", () => {
    const subject = { aaa: 111, bbb: 222 };
    pointerAssign("/aaa", subject, "foo");
    expect(subject).to.eql({ aaa: "foo", bbb: 222 });
  });

  test("adds a property", () => {
    const subject = { aaa: 111 };
    pointerAssign("/bbb", subject, "foo");
    expect(subject).to.eql({ aaa: 111, bbb: "foo" });
  });

  test("sets a nested property", () => {
    const aaa = { ccc: 333 };
    const subject = { aaa };
    pointerAssign("/aaa/ccc", subject, "foo");
    expect(subject).to.eql({ aaa: { ccc: "foo" } });
    expect(subject.aaa).to.equal(aaa);
  });

  test("sets by segments", () => {
    const subject = { aaa: {} };
    pointerAssign(["aaa", "a/b"], subject, "foo");
    expect(subject).to.eql({ aaa: { "a/b": "foo" } });
  });

  test("returns nothing", () => {
    expect(pointerAssign("/aaa", {}, "foo")).to.equal(undefined);
  });

  test("with the empty pointer, does nothing", () => {
    const subject = { aaa: 111 };
    pointerAssign("", subject, "foo");
    expect(subject).to.eql({ aaa: 111 });
  });

  describe("arrays", () => {
    test("sets an item", () => {
      const subject = [111, 222];
      pointerAssign("/0", subject, "foo");
      expect(subject).to.eql(["foo", 222]);
    });

    test("- adds an item to the end", () => {
      const subject = [111, 222];
      pointerAssign("/-", subject, "foo");
      expect(subject).to.eql([111, 222, "foo"]);
    });

    test("an index past the end leaves holes before it", () => {
      /** @type Json[] */
      const subject = [111];
      pointerAssign("/3", subject, "foo");
      expect(subject).to.have.length(4);
      expect(Object.keys(subject)).to.eql(["0", "3"]);
    });

    test("throws for a segment that isn't an index or -", () => {
      expect(() => pointerAssign("/01", [111, 222], "foo")).to.throw(InvalidIndexError);
      expect(() => pointerAssign("/foo", [111, 222], "foo")).to.throw(InvalidIndexError);
    });
  });

  describe("__proto__", () => {
    /** @type JsonObject */
    const subject = {};
    pointerAssign("/__proto__", subject, { polluted: true });

    test("is set as an own property", () => {
      expect(Object.hasOwn(subject, "__proto__")).to.equal(true);
      expect(JSON.stringify(subject)).to.equal(`{"__proto__":{"polluted":true}}`);
    });

    test("doesn't change the prototype", () => {
      expect(Object.getPrototypeOf(subject)).to.equal(Object.prototype);
      expect(subject).to.not.have.property("polluted");
    });

    test("isn't there when it's inherited", () => {
      expect(() => pointerAssign("/__proto__/polluted", {}, true)).to.throw(NotAContainerError);
      expect(Object.prototype).to.not.have.property("polluted");
    });
  });

  describe("what has to exist", () => {
    test("throws when what it would be set in isn't there", () => {
      expect(() => pointerAssign("/aaa/ccc/bbb", { aaa: { bbb: {} } }, "foo")).to.throw(NotAContainerError);
    });

    test.each([
      ["a string", "foo"],
      ["a number", 42],
      ["a boolean", true],
      ["null", null]
    ])("throws when what it would be set in is %s", (_type, value) => {
      expect(() => pointerAssign("/0", value, "foo")).to.throw(NotAContainerError);
    });

    test("doesn't change anything when it throws", () => {
      const subject = { aaa: { bbb: 222 } };
      expect(() => pointerAssign("/aaa/ccc/ddd", subject, "foo")).to.throw(NotAContainerError);
      expect(subject).to.eql({ aaa: { bbb: 222 } });
    });
  });

  describe("an invalid pointer", () => {
    test("throws", () => {
      expect(() => pointerAssign("foo", {}, "foo")).to.throw(InvalidPointerError);
    });
  });

  describe("given only a pointer", () => {
    test("returns a function that takes the subject and the value", () => {
      const addItem = pointerAssign("/-");
      const subject = [111];
      addItem(subject, 222);
      addItem(subject, 333);
      expect(subject).to.eql([111, 222, 333]);
    });

    test("throws for an invalid pointer before there's a subject", () => {
      expect(() => pointerAssign("foo")).to.throw(InvalidPointerError);
    });
  });
});
