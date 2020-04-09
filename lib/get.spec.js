const { expect } = require("chai");
const JsonPointer = require("./json-pointer");


describe("JsonPointer", () => {
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
    "~0": 9,
    "~1": 10,
    "/0": 11,
    "/1": 12,
    "aaa": null,
    "bbb": { "-": { "ccc": 13 } }
  };

  describe("get", () => {
    [
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
      ["/~00", 9],
      ["/~01", 10],
      ["/~10", 11],
      ["/~11", 12],
      ["/bbb/-/ccc", 13],
      ["/bbb/-", { "ccc": 13 }],
      ["/bar", undefined],
      ["/foo/2", undefined],
      ["/foo/-", undefined],
      ["/0", undefined]
    ].forEach(([pointer, expected]) => {
      describe(JSON.stringify(pointer), () => {
        let ptr;

        beforeEach(() => {
          ptr = JsonPointer.get(pointer);
        });

        it(`should equal ${JSON.stringify(expected)}`, () => {
          expect(ptr(subject)).to.eql(expected);
        });
      });
    });
  });

  describe("indexing into a number", () => {
    it("should throw an error", () => {
      const ptr = JsonPointer.get("//foo");
      expect(() => ptr(subject)).to.throw(Error, "Value at '/' is a number and does not have property 'foo'");
    });
  });

  describe("indexing into a string", () => {
    it("should throw an error", () => {
      const ptr = JsonPointer.get("/foo/0/0");
      expect(() => ptr(subject)).to.throw(Error, "Value at '/foo/0' is a string and does not have property '0'");
    });
  });

  describe("indexing into a null", () => {
    it("should throw an error", () => {
      const ptr = JsonPointer.get("/aaa/0");
      expect(() => ptr(subject)).to.throw(Error, "Value at '/aaa' is null and does not have property '0'");
    });
  });

  describe("a pointer that doesn't start with '/'", () => {
    it("should throw an error", () => {
      expect(() => JsonPointer.get("foo")).to.throw(Error, "Invalid JSON Pointer");
    });
  });
});
