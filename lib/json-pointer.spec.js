const { expect } = require("chai");
const { Given, When, Then } = require("./mocha-gherkin.spec");
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

describe("JsonPointer.set", () => {
  Given("The nil pointer", () => {
    const pointer = JsonPointer.nil;

    When("setting any value", () => {
      const subject = "anything";
      const result = JsonPointer.set(pointer, subject, "foo");

      Then("the value is echoed back", () => {
        expect(result).to.equal("foo");
      });
    });
  });

  Given("a pointer to a property of an object", () => {
    const pointer = "/aaa";

    When("setting a property", () => {
      const subject = { "aaa": 111, "bbb": [] };
      const result = JsonPointer.set(pointer, subject, "foo");

      Then("the new value should be set", () => {
        expect(result.aaa).to.equal("foo");
      });

      Then("the other properties should not change", () => {
        expect(result.bbb).to.equal(subject.bbb);
      });
    });
  });

  Given("a pointer to an item of an array", () => {
    const pointer = "/0";

    When("setting an item", () => {
      const subject = [111, []];
      const result = JsonPointer.set(pointer, subject, "foo");

      Then("the new value should be set", () => {
        expect(result[0]).to.equal("foo");
      });

      Then("the other items should not change", () => {
        expect(result[1]).to.equal(subject[1]);
      });
    });
  });

  Given("a pointer to a nested property of an object", () => {
    const pointer = "/aaa/ccc";

    When("setting a property", () => {
      const subject = { "aaa": { "ccc": [], "ddd": [] }, "bbb": [] };
      const result = JsonPointer.set(pointer, subject, "foo");

      Then("the new value should be set", () => {
        expect(result.aaa.ccc).to.equal("foo");
      });

      Then("the other properties should not change", () => {
        expect(result).to.equal(subject);
        expect(result.bbb).to.equal(subject.bbb);
        expect(result.aaa.ddd).to.equal(subject.aaa.ddd);
      });
    });
  });

  Given("an empty object", () => {
    const subject = {};

    When("setting a value that doesn't exist", () => {
      const result = JsonPointer.set("/aaa", subject, "foo");

      Then("the value should be set", () => {
        expect(result.aaa).to.equal("foo");
      });
    });

    When("setting a value whose parent doesn't exist", () => {
      const set = JsonPointer.set("/aaa/bbb");

      Then("an error should be thrown", () => {
        expect(() => set(subject, "foo")).to.throw(Error, "Value at '' does not have index 'aaa'");
      });
    });
  });

  Given("an empty array", () => {
    const subject = [];

    When("setting a value that doesn't exist", () => {
      const result = JsonPointer.set("/0", subject, "foo");

      Then("the value should be set", () => {
        expect(result[0]).to.equal("foo");
      });
    });
  });

  Given("a number", () => {
    const subject = 42;

    When("indexing into the string", () => {
      const set = JsonPointer.set("/0");

      Then("an error should be thrown", () => {
        expect(() => set(subject, "foo")).to.throw(Error, "Value at '' is a scalar and can't be indexed");
      });
    });
  });

  Given("a string", () => {
    const subject = "foo";

    When("indexing into the string", () => {
      const set = JsonPointer.set("/0");

      Then("an error should be thrown", () => {
        expect(() => set(subject, "foo")).to.throw(Error, "Value at '' is a scalar and can't be indexed");
      });
    });
  });

  Given("null", () => {
    const subject = null;

    When("indexing into null", () => {
      const set = JsonPointer.set("/0");

      Then("an error should be thrown", () => {
        expect(() => set(subject, "foo")).to.throw(Error, "Value at '' is a scalar and can't be indexed");
      });
    });
  });
});
