import { expect } from "chai";
import { Given, When, Then } from "./mocha-gherkin.spec.js";
import * as JsonPointer from "./index.js";
import type { Json, JsonObject, Pointable } from "./index.js";


describe("JsonPointer.set", () => {
  Given("The nil pointer", () => {
    const pointer = JsonPointer.nil;

    When("setting any value", () => {
      const subject = { foo: "bar" };
      const result = JsonPointer.set(pointer, subject, "foo");

      Then("the value is echoed back", () => {
        expect(result).to.equal("foo");
      });

      Then("the original value should not change", () => {
        expect(subject).to.eql({ foo: "bar" });
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

  Given("a pointer to a nested item of an array", () => {
    const pointer = "/0/1";

    When("setting an item", () => {
      const subject: [number[], number] = [[333, 444], 222];
      const result = JsonPointer.set(pointer, subject, 555);

      Then("the new value should be set", () => {
        expect(result[0][1]).to.equal(555);
      });

      Then("the original value should not change", () => {
        expect(subject[0][1]).to.equal(444);
      });

      Then("the other properties should not change", () => {
        expect(result[1]).to.equal(subject[1]);
        expect(result[0][0]).to.equal(subject[0][0]);
      });
    });
  });

  Given("an object", () => {
    let subject: JsonObject;

    beforeEach(() => {
      subject = { aaa: { bbb: {} } };
    });

    When("setting a value that doesn't exist", () => {
      let result: JsonObject;

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
        expect(() => set(subject, "foo")).to.throw(Error, "Value at '/aaa/ccc' is undefined and does not have property 'bbb'");
      });
    });
  });

  Given("an array", () => {
    let subject: Json[];

    beforeEach(() => {
      subject = [];
    });

    When("setting a value that doesn't exist", () => {
      let result: Json[];

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

    When("adding an item to the end of the array", () => {
      let result: Json[];

      beforeEach(() => {
        result = JsonPointer.set("/-", subject, "foo");
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
    let subject: unknown;

    beforeEach(() => {
      subject = 42;
    });

    When("indexing into the number", () => {
      const set = JsonPointer.set("/0");

      Then("an error should be thrown", () => {
        expect(() => set(subject as Pointable, "foo")).to.throw(TypeError, "Value at '' is a number and does not have property '0'");
      });
    });
  });

  Given("a string", () => {
    let subject: unknown;

    beforeEach(() => {
      subject = "foo";
    });

    When("indexing into the string", () => {
      const set = JsonPointer.set("/0");

      Then("an error should be thrown", () => {
        expect(() => set(subject as Pointable, "foo")).to.throw(TypeError, "Value at '' is a string and does not have property '0'");
      });
    });
  });

  Given("null", () => {
    let subject: unknown;

    beforeEach(() => {
      subject = null;
    });

    When("indexing into null", () => {
      const set = JsonPointer.set("/0");

      Then("an error should be thrown", () => {
        expect(() => set(subject as Pointable, "foo")).to.throw(Error, "Value at '' is null and does not have property '0'");
      });
    });
  });
});
