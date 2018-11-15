import { expect } from "chai";
import * as JsonPointer from "~/json-pointer";


describe("JsonPonter", () => {
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
      describe(JSON.stringify(pointer), () => {
        let ptr;

        beforeEach(() => {
          ptr = JsonPointer.get(pointer);
        });

        it(`should equal ${JSON.stringify(expected)}`, () => {
          expect(ptr(value)).to.eql(expected);
        });
      });
    });
  });
});
