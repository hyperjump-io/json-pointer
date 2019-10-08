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

      Then("the original value should not change", () => {
        expect(subject).to.equal("anything");
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

      Then("the original value should not change", () => {
        expect(subject.aaa).to.equal(111);
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

      Then("the original value should not change", () => {
        expect(subject[0]).to.equal(111);
      });

      Then("the other items should not change", () => {
        expect(result[1]).to.equal(subject[1]);
      });
    });
  });

  Given("a pointer to a nested property of an object", () => {
    const pointer = "/aaa/ccc";

    When("setting a property", () => {
      const subject = { "aaa": { "ccc": 333, "ddd": 444 }, "bbb": 222 };
      const result = JsonPointer.set(pointer, subject, "foo");

      Then("the new value should be set", () => {
        expect(result.aaa.ccc).to.equal("foo");
      });

      Then("the original value should not change", () => {
        expect(subject.aaa.ccc).to.equal(333);
      });

      Then("the other properties should not change", () => {
        expect(result.bbb).to.equal(subject.bbb);
        expect(result.aaa.ddd).to.equal(subject.aaa.ddd);
      });
    });
  });

  Given("an object", () => {
    const subject = { aaa: { bbb: {} } };

    When("setting a value that doesn't exist", () => {
      const result = JsonPointer.set("/bbb", subject, "foo");

      Then("the value should be set", () => {
        expect(result.bbb).to.equal("foo");
      });

      Then("the original value should not change", () => {
        expect(subject.bbb).to.equal(undefined);
      });
    });

    When("setting a value whose parent doesn't exist", () => {
      const set = JsonPointer.set("/aaa/ccc/bbb");

      Then("an error should be thrown", () => {
        expect(() => set(subject, "foo")).to.throw(Error, "Value at '/aaa' does not have index 'ccc'");
      });
    });
  });

  Given("an array", () => {
    const subject = [];

    When("setting a value that doesn't exist", () => {
      const result = JsonPointer.set("/0", subject, "foo");

      Then("the value should be set", () => {
        expect(result[0]).to.equal("foo");
      });

      Then("the original value should not change", () => {
        expect(subject[0]).to.equal(undefined);
      });
    });
  });

  Given("a number", () => {
    const subject = 42;

    When("indexing into the number", () => {
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

describe("JsonPointer.mutate", () => {
  Given("The nil pointer", () => {
    const pointer = JsonPointer.nil;

    When("mutating any value", () => {
      const subject = "anything";
      JsonPointer.mutate(pointer, subject, "foo");

      Then("the value is not changed", () => {
        expect(subject).to.equal("anything");
      });
    });
  });

  Given("a pointer to a property of an object", () => {
    const pointer = "/aaa";

    When("mutating a property", () => {
      const subject = { "aaa": 111, "bbb": [] };
      JsonPointer.mutate(pointer, subject, "foo");

      Then("the new value should be set", () => {
        expect(subject.aaa).to.equal("foo");
      });
    });
  });

  Given("a pointer to an item of an array", () => {
    const pointer = "/0";

    When("mutating an item", () => {
      const subject = [111, 222];
      JsonPointer.mutate(pointer, subject, "foo");

      Then("the new value should be set", () => {
        expect(subject[0]).to.equal("foo");
      });
    });
  });

  Given("a pointer to a nested property of an object", () => {
    const pointer = "/aaa/ccc";

    When("mutating a property", () => {
      const subject = { "aaa": { "ccc": 333, "ddd": 444 }, "bbb": 222 };
      JsonPointer.mutate(pointer, subject, "foo");

      Then("the new value should be set", () => {
        expect(subject.aaa.ccc).to.equal("foo");
      });
    });
  });

  Given("an object", () => {
    const subject = { aaa: { bbb: {} } };

    When("mutating a value that doesn't exist", () => {
      JsonPointer.mutate("/bbb", subject, "foo");

      Then("the value should be set", () => {
        expect(subject.bbb).to.equal("foo");
      });
    });

    When("mutating a value whose parent doesn't exist", () => {
      const mutate = JsonPointer.mutate("/aaa/ccc/bbb");

      Then("an error should be thrown", () => {
        expect(() => mutate(subject, "foo")).to.throw(Error, "Value at '/aaa' does not have index 'ccc'");
      });
    });
  });

  Given("an array", () => {
    const subject = [];

    When("mutating a value that doesn't exist", () => {
      JsonPointer.mutate("/0", subject, "foo");

      Then("the value should be set", () => {
        expect(subject[0]).to.equal("foo");
      });
    });
  });

  Given("a number", () => {
    const subject = 42;

    When("indexing into the number", () => {
      const mutate = JsonPointer.mutate("/0");

      Then("an error should be thrown", () => {
        expect(() => mutate(subject, "foo")).to.throw(Error, "Value at '' is a scalar and can't be indexed");
      });
    });
  });

  Given("a string", () => {
    const subject = "foo";

    When("indexing into the string", () => {
      const mutate = JsonPointer.mutate("/0");

      Then("an error should be thrown", () => {
        expect(() => mutate(subject, "foo")).to.throw(Error, "Value at '' is a scalar and can't be indexed");
      });
    });
  });

  Given("null", () => {
    const subject = null;

    When("indexing into null", () => {
      const mutate = JsonPointer.mutate("/0");

      Then("an error should be thrown", () => {
        expect(() => mutate(subject, "foo")).to.throw(Error, "Value at '' is a scalar and can't be indexed");
      });
    });
  });
});
