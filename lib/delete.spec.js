const { expect } = require("chai");
const { Given, When, Then } = require("./mocha-gherkin.spec");
const JsonPointer = require("./json-pointer");


describe("JsonPointer.delete", () => {
  Given("The nil pointer", () => {
    const pointer = JsonPointer.nil;

    When("deleting any value", () => {
      const subject = "anything";
      JsonPointer.delete(pointer, subject);

      Then("the value is not changed", () => {
        expect(subject).to.equal("anything");
      });
    });
  });

  Given("a pointer to a property of an object", () => {
    const pointer = "/aaa";

    When("deleting a property", () => {
      const subject = { "aaa": 111, "bbb": [] };
      JsonPointer.delete(pointer, subject);

      Then("the value should be deleted", () => {
        expect(subject).to.eql({ "bbb": [] });
      });
    });
  });

  Given("a pointer to an item of an array", () => {
    const pointer = "/0";

    When("deleting an item", () => {
      const subject = [111, 222];
      JsonPointer.delete(pointer, subject);

      Then("the value should be deleted", () => {
        expect(subject).to.eql([222]);
      });
    });
  });

  Given("a pointer to a nested property of an object", () => {
    const pointer = "/aaa/ccc";

    When("deleting a property", () => {
      const subject = { "aaa": { "ccc": 333, "ddd": 444 }, "bbb": 222 };
      JsonPointer.delete(pointer, subject);

      Then("the value should be deleted", () => {
        expect(subject).to.eql({ "aaa": { "ddd": 444 }, "bbb": 222 });
      });
    });
  });

  Given("an object", () => {
    let subject;

    beforeEach(() => {
      subject = { aaa: { bbb: {} } };
    });

    When("deleting a value that doesn't exist", () => {
      beforeEach(() => {
        JsonPointer.delete("/bbb", subject);
      });

      Then("the value should be unchanged", () => {
        expect(subject).to.eql({ aaa: { bbb: {} } });
      });
    });

    When("deleting a value whose parent doesn't exist", () => {
      const remove = JsonPointer.delete("/aaa/ccc/bbb");

      Then("an error should be thrown", () => {
        expect(() => remove(subject)).to.throw(Error, "Value at '/aaa' does not have index 'ccc'");
      });
    });
  });

  Given("an array", () => {
    let subject;

    beforeEach(() => {
      subject = [];
    });

    When("deleting a value that doesn't exist", () => {
      beforeEach(() => {
        JsonPointer.delete("/0", subject, "foo");
      });

      Then("the value should be unchanged", () => {
        expect(subject).to.eql([]);
      });
    });

    When("deleting past the end of the array", () => {
      beforeEach(() => {
        JsonPointer.delete("/-", subject, "foo");
      });

      Then("the value should be unchanged", () => {
        expect(subject).to.eql([]);
      });
    });
  });

  Given("a number", () => {
    let subject;

    beforeEach(() => {
      subject = 42;
    });

    When("indexing into the number", () => {
      const remove = JsonPointer.delete("/0");

      Then("an error should be thrown", () => {
        expect(() => remove(subject)).to.throw(Error, "Value at '' is a scalar and can't be indexed");
      });
    });
  });

  Given("a string", () => {
    let subject;

    beforeEach(() => {
      subject = "foo";
    });

    When("indexing into the string", () => {
      const remove = JsonPointer.delete("/0");

      Then("an error should be thrown", () => {
        expect(() => remove(subject)).to.throw(Error, "Value at '' is a scalar and can't be indexed");
      });
    });
  });

  Given("null", () => {
    let subject;

    beforeEach(() => {
      subject = null;
    });

    When("indexing into null", () => {
      const remove = JsonPointer.delete("/0");

      Then("an error should be thrown", () => {
        expect(() => remove(subject)).to.throw(Error, "Value at '' is a scalar and can't be indexed");
      });
    });
  });
});
