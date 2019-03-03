const curry = require("just-curry-it");


const nil = "";

const get = (pointer, value = undefined) => {
  if (pointer.length > 0 && pointer[0] !== "/") {
    throw Error("Invalid JSON Pointer");
  }

  const ptr = pointer.split("/").slice(1).map(unescape);

  const fn = (value) => ptr.reduce(([value, pointer], segment) => {
    return [applySegment(value, segment, pointer), append(segment, pointer)];
  }, [value, ""])[0];

  return value === undefined ? fn : fn(value);
};

const append = curry((segment, pointer) => pointer + "/" + escape(segment));

const escape = (segment) => segment.toString().replace(/~/g, "~0").replace(/\//g, "~1");
const unescape = (segment) => segment.toString().replace(/~0/g, "~").replace(/~1/g, "/");

const applySegment = (value, segment, pointer = "") => {
  if (value === null || typeof value !== "object") {
    throw Error(`Value at '${pointer}' is a scalar and can't be indexed`);
  } else if (!(segment in value)) {
    throw Error(`Value at '${pointer}' does not have index '${segment}'`);
  }

  return value[segment];
};

module.exports = { nil, get, append };
