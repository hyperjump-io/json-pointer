const curry = require("just-curry-it");


const nil = "";

const compile = (pointer) => {
  if (pointer.length > 0 && pointer[0] !== "/") {
    throw Error("Invalid JSON Pointer");
  }

  return pointer.split("/").slice(1).map(unescape);
};

const get = (pointer, value = undefined) => {
  const ptr = compile(pointer);

  const fn = (value) => ptr.reduce(([value, pointer], segment) => {
    return [applySegment(value, segment, pointer), append(segment, pointer)];
  }, [value, ""])[0];

  return value === undefined ? fn : fn(value);
};

const set = (pointer, subject = undefined, value = undefined) => {
  const ptr = compile(pointer);
  const fn = curry((subject, value) => _set(ptr, subject, value, nil));
  return subject === undefined ? fn : fn(subject, value);
};

const _set = (pointer, subject, value, cursor) => {
  if (pointer.length === 0) {
    return value;
  } else if (pointer.length > 1) {
    const segment = pointer.shift();
    subject[segment] = _set(pointer, applySegment(subject, segment, cursor), value, append(segment, cursor));
    return subject;
  } else if (Array.isArray(subject)) {
    const clonedSubject = subject.map((a) => a);
    clonedSubject[pointer[0]] = value;
    return clonedSubject;
  } else if (typeof subject === "object" && subject !== null) {
    return { ...subject, [pointer[0]]: value };
  } else {
    return applySegment(value, pointer[0], cursor);
  }
};

const append = curry((segment, pointer) => pointer + "/" + escape(segment));

const escape = (segment) => segment.toString().replace(/~/g, "~0").replace(/\//g, "~1");
const unescape = (segment) => segment.toString().replace(/~0/g, "~").replace(/~1/g, "/");

const applySegment = (value, segment, cursor = "") => {
  if (value === null || typeof value !== "object") {
    throw Error(`Value at '${cursor}' is a scalar and can't be indexed`);
  } else if (!(segment in value)) {
    throw Error(`Value at '${cursor}' does not have index '${segment}'`);
  }

  return value[segment];
};

module.exports = { nil, get, set, append };
