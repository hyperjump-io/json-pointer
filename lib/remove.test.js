import { beforeEach, describe, expect } from "vitest";
import { Given, When, Then } from "./gherkin.js";
import * as JsonPointer from "./index.js";

/**
 * @import { Json, JsonObject } from "./index.js"
 */


describe("JsonPointer.remove", () => {
  Given("The nil pointer", () => {
    const pointer = JsonPointer.nil;

    When("deleting any value", () => {
      const subject = { foo: "bar" };
      JsonPointer.remove(pointer, subject);

      Then("the value is not changed", () => {
        expect(subject).to.eql({ foo: "bar" });
      });
    });
  });

  Given("a pointer to a property of an object", () => {
    const pointer = "/aaa";

    When("deleting a property", () => {
      const subject = { aaa: 111, bbb: [] };
      JsonPointer.remove(pointer, subject);

      Then("the value should be removed", () => {
        expect(subject).to.eql({ bbb: [] });
      });
    });
  });

  Given("a pointer to an item of an array", () => {
    const pointer = "/0";

    When("deleting an item", () => {
      const subject = [111, 222];
      JsonPointer.remove(pointer, subject);

      Then("the value should be removed", () => {
        expect(subject).to.eql([undefined, 222]);
      });
    });
  });

  Given("a pointer to a nested property of an object", () => {
    const pointer = "/aaa/ccc";

    When("deleting a property", () => {
      const subject = { aaa: { ccc: 333, ddd: 444 }, bbb: 222 };
      JsonPointer.remove(pointer, subject);

      Then("the value should be removed", () => {
        expect(subject).to.eql({ aaa: { ddd: 444 }, bbb: 222 });
      });
    });
  });

  Given("an object", () => {
    /** @type JsonObject */
    let subject;

    beforeEach(() => {
      subject = { aaa: { bbb: {} } };
    });

    When("deleting a value that doesn't exist", () => {
      beforeEach(() => {
        JsonPointer.remove("/bbb", subject);
      });

      Then("the value should be unchanged", () => {
        expect(subject).to.eql({ aaa: { bbb: {} } });
      });
    });

    When("deleting a value whose parent doesn't exist", () => {
      const remove = JsonPointer.remove("/aaa/ccc/bbb");

      Then("an error should be thrown", () => {
        expect(() => remove(subject)).to.throw(Error, "Value at '/aaa/ccc' is undefined and does not have property 'bbb'");
      });
    });
  });

  Given("an array", () => {
    /** @type Json[] */
    let subject;

    beforeEach(() => {
      subject = [];
    });

    When("deleting a value that doesn't exist", () => {
      beforeEach(() => {
        JsonPointer.remove("/0", subject);
      });

      Then("the value should be unchanged", () => {
        expect(subject).to.eql([]);
      });
    });

    When("deleting past the end of the array", () => {
      beforeEach(() => {
        JsonPointer.remove("/-", subject);
      });

      Then("the value should be unchanged", () => {
        expect(subject).to.eql([]);
      });
    });
  });

  Given("a number", () => {
    /** @type number */
    let subject;

    beforeEach(() => {
      subject = 42;
    });

    When("indexing into the number", () => {
      const remove = JsonPointer.remove("/0");

      Then("an error should be thrown", () => {
        expect(() => remove(subject)).to.throw(Error, "Value at '' is a number and does not have property '0'");
      });
    });
  });

  Given("a string", () => {
    /** @type string */
    let subject;

    beforeEach(() => {
      subject = "foo";
    });

    When("indexing into the string", () => {
      const remove = JsonPointer.remove("/0");

      Then("an error should be thrown", () => {
        expect(() => remove(subject)).to.throw(Error, "Value at '' is a string and does not have property '0'");
      });
    });
  });

  Given("null", () => {
    /** @type null */
    let subject;

    beforeEach(() => {
      subject = null;
    });

    When("indexing into null", () => {
      const remove = JsonPointer.remove("/0");

      Then("an error should be thrown", () => {
        expect(() => remove(subject)).to.throw(Error, "Value at '' is null and does not have property '0'");
      });
    });
  });
});
