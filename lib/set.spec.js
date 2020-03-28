const { expect } = require("chai");
const { Given, When, Then } = require("./mocha-gherkin.spec");
const JsonPointer = require("./json-pointer");


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
    let subject;

    beforeEach(() => {
      subject = { aaa: { bbb: {} } };
    });

    When("setting a value that doesn't exist", () => {
      let result;

      beforeEach(() => {
        result = JsonPointer.set("/bbb", subject, "foo");
      });

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
    let subject;

    beforeEach(() => {
      subject = [];
    });

    When("setting a value that doesn't exist", () => {
      let result;

      beforeEach(() => {
        result = JsonPointer.set("/0", subject, "foo");
      });

      Then("the value should be set", () => {
        expect(result[0]).to.equal("foo");
      });

      Then("the original value should not change", () => {
        expect(subject[0]).to.equal(undefined);
      });
    });
  });

  Given("a number", () => {
    let subject;

    beforeEach(() => {
      subject = 42;
    });

    When("indexing into the number", () => {
      const set = JsonPointer.set("/0");

      Then("an error should be thrown", () => {
        expect(() => set(subject, "foo")).to.throw(Error, "Value at '' is a scalar and can't be indexed");
      });
    });
  });

  Given("a string", () => {
    let subject;

    beforeEach(() => {
      subject = "foo";
    });

    When("indexing into the string", () => {
      const set = JsonPointer.set("/0");

      Then("an error should be thrown", () => {
        expect(() => set(subject, "foo")).to.throw(Error, "Value at '' is a scalar and can't be indexed");
      });
    });
  });

  Given("null", () => {
    let subject;

    beforeEach(() => {
      subject = null;
    });

    When("indexing into null", () => {
      const set = JsonPointer.set("/0");

      Then("an error should be thrown", () => {
        expect(() => set(subject, "foo")).to.throw(Error, "Value at '' is a scalar and can't be indexed");
      });
    });
  });
});
