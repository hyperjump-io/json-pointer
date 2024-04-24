import { describe, expect, test } from "vitest";
import * as JsonPointer from "./index.js";


describe("append", () => {
  test("should append a segment to a pointer", () => {
    const subject = JsonPointer.append("bar", "/foo");
    expect(subject).to.eql("/foo/bar");
  });

  test("should append a segment to the nil pointer", () => {
    const subject = JsonPointer.append("bar", JsonPointer.nil);
    expect(subject).to.eql("/bar");
  });

  test("should escape a segment when it is appended to a pointer", () => {
    const subject = JsonPointer.append("b~a/r", "/foo");
    expect(subject).to.eql("/foo/b~0a~1r");
  });
});
