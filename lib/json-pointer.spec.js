import { expect } from "chai";
import * as JsonPointer from "~/json-pointer";


describe("JsonPonter", () => {
  describe("cons", () => {
    it("should construct a pointer from nil", () => {
      const subject = JsonPointer.cons("foo", JsonPointer.nil);
      expect(subject).to.eql("/foo");
    });

    it("should construct a JSON Pointer from a pointer", () => {
      const subject = JsonPointer.cons("bar", "/foo");
      expect(subject).to.eql("/bar/foo");
    });
  });

  describe("dcons", () => {
    it("should deconstruct a simple reference-token", () => {
      const subject = JsonPointer.decons("/foo/bar");
      expect(subject).to.eql(["foo", "/bar"]);
    });

    it("should deconstruct a reference-token that is an empty string", () => {
      const subject = JsonPointer.decons("//bar");
      expect(subject).to.eql(["", "/bar"]);
    });

    it("should deconstruct a reference-token with whitespace", () => {
      const subject = JsonPointer.decons("/ /bar");
      expect(subject).to.eql([" ", "/bar"]);
    });

    it("should deconstruct a reference-token with a /", () => {
      const subject = JsonPointer.decons("/a~1b/bar");
      expect(subject).to.eql(["a/b", "/bar"]);
    });

    it("should deconstruct a reference-token with a ~", () => {
      const subject = JsonPointer.decons("/m~0n/bar");
      expect(subject).to.eql(["m~n", "/bar"]);
    });
  });

  describe("append", () => {
    it("should append a segment to a ponter", () => {
      const subject = JsonPointer.append("/foo", "bar");
      expect(subject).to.eql("/foo/bar");
    });

    it("should append a segment to the nil ponter", () => {
      const subject = JsonPointer.append(JsonPointer.nil, "bar");
      expect(subject).to.eql("/bar");
    });

    it("should escape an segment when it is appended to a ponter", () => {
      const subject = JsonPointer.append("/foo", "b~a/r");
      expect(subject).to.eql("/foo/b~0a~1r");
    });
  });

  describe("get",  () => {
    const value = {
      "foo": ["bar", "baz"],
      "": 0,
      "a/b": 1,
      "c%d": 2,
      "e^f": 3,
      "g|h": 4,
      "i\\j": 5,
      "k\"l": 6,
      " ": 7,
      "m~n": 8
    };

    [
      [undefined, value],
      ["", value],
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
      ["/m~0n", 8]
    ].forEach(([pointer, expected]) => {
      describe(`value, ${JSON.stringify(pointer)}`, () => {
        const subject = JsonPointer.get(value, pointer);
        it(`should equal ${JSON.stringify(expected)}`, () => {
          expect(subject).to.eql(expected);
        });
      });
    });
  });
});
