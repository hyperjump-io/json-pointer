const { expect } = require("chai");
const JsonPointer = require("./json-pointer");


describe("append", () => {
  it("should append a segment to a ponter", () => {
    const subject = JsonPointer.append("bar", "/foo");
    expect(subject).to.eql("/foo/bar");
  });

  it("should append a segment to the nil ponter", () => {
    const subject = JsonPointer.append("bar", JsonPointer.nil);
    expect(subject).to.eql("/bar");
  });

  it("should escape an segment when it is appended to a ponter", () => {
    const subject = JsonPointer.append("b~a/r", "/foo");
    expect(subject).to.eql("/foo/b~0a~1r");
  });
});
