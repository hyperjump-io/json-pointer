const { expect } = require("chai");
const JsonPointer = require("./json-pointer");


describe("JsonPonter", () => {
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
    "aaa": null
  };

  describe("append", () => {
    it("should append a segment to a ponter", () => {
      const subject = JsonPointer.append("bar", "/foo");
      expect(subject).to.eql("/foo/bar");
    });

    it("should append a segment to the nil ponter", () => {
      const subject = JsonPointer.append("bar", JsonPointer.nil);
      expect(subject).to.eql("/bar");
    });

    it("should escape an segment when it is appended to a ponter", () => {
      const subject = JsonPointer.append("b~a/r", "/foo");
      expect(subject).to.eql("/foo/b~0a~1r");
    });
  });

  describe("get",  () => {
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
      ["/m~0n", 8]
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

  describe("pointing to a property that doesn't exist", () => {
    it("should throw an error", () => {
      const ptr = JsonPointer.get("/bar");
      expect(() => ptr(subject)).to.throw(Error, "Value at '' does not have index 'bar'");
    });
  });

  describe("pointing to an index that doesn't exist", () => {
    it("should throw an error", () => {
      const ptr = JsonPointer.get("/foo/3");
      expect(() => ptr(subject)).to.throw(Error, "Value at '/foo' does not have index '3'");
    });
  });

  describe("indexing into a scalar", () => {
    it("should throw an error", () => {
      const ptr = JsonPointer.get("//foo");
      expect(() => ptr(subject)).to.throw(Error, "Value at '/' is a scalar and can't be indexed");
    });
  });

  describe("indexing into a string", () => {
    it("should throw an error", () => {
      const ptr = JsonPointer.get("/foo/0/0");
      expect(() => ptr(subject)).to.throw(Error, "Value at '/foo/0' is a scalar and can't be indexed");
    });
  });

  describe("indexing into a null", () => {
    it("should throw an error", () => {
      const ptr = JsonPointer.get("/aaa/0");
      expect(() => ptr(subject)).to.throw(Error, "Value at '/aaa' is a scalar and can't be indexed");
    });
  });

  describe("a pointer that doesn't start with '/'", () => {
    it("should throw an error", () => {
      expect(() => JsonPointer.get("foo")).to.throw(Error, "Invalid JSON Pointer");
    });
  });
});
