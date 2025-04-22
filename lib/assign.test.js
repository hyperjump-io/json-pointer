import { beforeEach, describe, expect } from "vitest";
import { Given, When, Then } from "./gherkin.js";
import * as JsonPointer from "./index.js";

/**
 * @import { Json, JsonObject } from "./index.js"
 */


describe("JsonPointer.assign", () => {
  Given("The nil pointer", () => {
    const pointer = JsonPointer.nil;

    When("mutating any value", () => {
      const subject = { foo: "bar" };
      JsonPointer.assign(pointer, subject, "foo");

      Then("the value is not changed", () => {
        expect(subject).to.eql({ foo: "bar" });
      });
    });
  });

  Given("a pointer to a property of an object", () => {
    const pointer = "/aaa";

    When("mutating a property", () => {
      const subject = { aaa: 111, bbb: [] };
      JsonPointer.assign(pointer, subject, "foo");

      Then("the new value should be set", () => {
        expect(subject.aaa).to.equal("foo");
      });
    });
  });

  Given("a pointer to an item of an array", () => {
    const pointer = "/0";

    When("mutating an item", () => {
      const subject = [111, 222];
      JsonPointer.assign(pointer, subject, "foo");

      Then("the new value should be set", () => {
        expect(subject[0]).to.equal("foo");
      });
    });
  });

  Given("a pointer to a nested property of an object", () => {
    const pointer = "/aaa/ccc";

    When("mutating a property", () => {
      const subject = { aaa: { ccc: 333, ddd: 444 }, bbb: 222 };
      JsonPointer.assign(pointer, subject, "foo");

      Then("the new value should be set", () => {
        expect(subject.aaa.ccc).to.equal("foo");
      });
    });
  });

  Given("an object", () => {
    /** @type JsonObject */
    let subject;

    beforeEach(() => {
      subject = { aaa: { bbb: {} } };
    });

    When("mutating a value that doesn't exist", () => {
      beforeEach(() => {
        JsonPointer.assign("/bbb", subject, "foo");
      });

      Then("the value should be set", () => {
        expect(subject.bbb).to.equal("foo");
      });
    });

    When("mutating a value whose parent doesn't exist", () => {
      const assign = JsonPointer.assign("/aaa/ccc/bbb");

      Then("an error should be thrown", () => {
        expect(() => assign(subject, "foo")).to.throw(Error, "Value at '/aaa/ccc' is undefined and does not have property 'bbb'");
      });
    });
  });

  Given("an array", () => {
    /** @type Json[] */
    let subject;

    beforeEach(() => {
      subject = [];
    });

    When("mutating a value that doesn't exist", () => {
      beforeEach(() => {
        JsonPointer.assign("/0", subject, "foo");
      });

      Then("the value should be set", () => {
        expect(subject[0]).to.equal("foo");
      });
    });

    When("adding an item to the end of the array", () => {
      beforeEach(() => {
        JsonPointer.assign("/-", subject, "foo");
      });

      Then("the value should be set", () => {
        expect(subject[0]).to.equal("foo");
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
      const assign = JsonPointer.assign("/0");

      Then("an error should be thrown", () => {
        expect(() => assign(subject, "foo")).to.throw(Error, "Value at '' is a number and does not have property '0'");
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
      const assign = JsonPointer.assign("/0");

      Then("an error should be thrown", () => {
        expect(() => assign(subject, "foo")).to.throw(Error, "Value at '' is a string and does not have property '0'");
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
      const assign = JsonPointer.assign("/0");

      Then("an error should be thrown", () => {
        expect(() => assign(subject, "foo")).to.throw(Error, "Value at '' is null and does not have property '0'");
      });
    });
  });
});
