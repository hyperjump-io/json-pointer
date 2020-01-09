const { expect } = require("chai");
const { Given, When, Then } = require("./mocha-gherkin.spec");
const JsonPointer = require("./json-pointer");


describe("JsonPointer.unset", () => {
  Given("The nil pointer", () => {
    const pointer = JsonPointer.nil;

    When("deleting any value", () => {
      const subject = "anything";
      const result = JsonPointer.unset(pointer, subject);

      Then("the value is undefined", () => {
        expect(result).to.equal(undefined);
      });

      Then("the original value should not change", () => {
        expect(subject).to.equal("anything");
      });
    });
  });

  Given("a pointer to a property of an object", () => {
    const pointer = "/aaa";

    When("deleting a property", () => {
      const subject = { "aaa": 111, "bbb": [] };
      const result = JsonPointer.unset(pointer, subject);

      Then("the value should be undefined", () => {
        expect(result.aaa).to.equal(undefined);
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

    When("deleting an item", () => {
      const subject = [111, []];
      const result = JsonPointer.unset(pointer, subject);

      Then("the value should be deleted", () => {
        expect(result).to.eql([[]]);
      });

      Then("the original value should not change", () => {
        expect(subject[0]).to.equal(111);
      });

      Then("the other items should not change", () => {
        expect(result[0]).to.equal(subject[1]);
      });
    });
  });

  Given("a pointer to a nested property of an object", () => {
    const pointer = "/aaa/ccc";

    When("deleting a property", () => {
      const subject = { "aaa": { "ccc": 333, "ddd": 444 }, "bbb": 222 };
      const result = JsonPointer.unset(pointer, subject);

      Then("the value should be undefined", () => {
        expect(result.aaa.ccc).to.equal(undefined);
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

    When("deleting a value that doesn't exist", () => {
      const result = JsonPointer.unset("/bbb", subject);

      Then("the value should be undefined", () => {
        expect(result.bbb).to.equal(undefined);
      });

      Then("the original value should not change", () => {
        expect(subject.bbb).to.equal(undefined);
      });
    });

    When("deleting a value whose parent doesn't exist", () => {
      const unset = JsonPointer.unset("/aaa/ccc/bbb");

      Then("an error should be thrown", () => {
        expect(() => unset(subject, "foo")).to.throw(Error, "Value at '/aaa' does not have index 'ccc'");
      });
    });
  });

  Given("an array", () => {
    const subject = [];

    When("deleting a value that doesn't exist", () => {
      const result = JsonPointer.unset("/0", subject);

      Then("the value should be removed", () => {
        expect(result).to.eql([]);
      });

      Then("the original value should not change", () => {
        expect(subject).to.eql([]);
      });
    });
  });

  Given("a number", () => {
    const subject = 42;

    When("indexing into the number", () => {
      const unset = JsonPointer.unset("/0");

      Then("an error should be thrown", () => {
        expect(() => unset(subject)).to.throw(Error, "Value at '' is a scalar and can't be indexed");
      });
    });
  });

  Given("a string", () => {
    const subject = "foo";

    When("indexing into the string", () => {
      const unset = JsonPointer.unset("/0");

      Then("an error should be thrown", () => {
        expect(() => unset(subject)).to.throw(Error, "Value at '' is a scalar and can't be indexed");
      });
    });
  });

  Given("null", () => {
    const subject = null;

    When("indexing into null", () => {
      const unset = JsonPointer.unset("/0");

      Then("an error should be thrown", () => {
        expect(() => unset(subject)).to.throw(Error, "Value at '' is a scalar and can't be indexed");
      });
    });
  });
});
