import { describe, it } from "vitest";

/**
 * @import { SuiteCollector, SuiteFactory, TestFunction } from "vitest"
 */


/** @type (message: string, fn?: SuiteFactory) => SuiteCollector */
export const Given = (message, fn) => describe("Given " + message, fn);

/** @type (message: string, fn?: SuiteFactory) => SuiteCollector */
export const When = (message, fn) => describe("When " + message, fn);

/** @type (message: string, fn?: TestFunction) => void */
export const Then = (message, fn) => {
  it("Then " + message, fn);
};

/** @type (message: string, fn?: SuiteFactory) => SuiteCollector */
export const And = (message, fn) => describe("And " + message, fn);
