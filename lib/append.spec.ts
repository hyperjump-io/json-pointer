import { expect } from "chai";
import JsonPointer from ".";


describe("append", () => {
  it("should append a segment to a pointer", () => {
    const subject = JsonPointer.append("bar", "/foo");
    expect(subject).to.eql("/foo/bar");
  });

  it("should append a segment to the nil pointer", () => {
    const subject = JsonPointer.append("bar", JsonPointer.nil);
    expect(subject).to.eql("/bar");
  });

  it("should escape a segment when it is appended to a pointer", () => {
    const subject = JsonPointer.append("b~a/r", "/foo");
    expect(subject).to.eql("/foo/b~0a~1r");
  });
});
