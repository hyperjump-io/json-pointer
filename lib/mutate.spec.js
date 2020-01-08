const { expect } = require("chai");
const { Given, When, Then } = require("./mocha-gherkin.spec");
const JsonPointer = require("./json-pointer");


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
