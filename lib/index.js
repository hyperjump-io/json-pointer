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
    return { ...subject, [segment]: _set(pointer, applySegment(subject, segment, cursor), value, append(segment, cursor)) };
  } else if (Array.isArray(subject)) {
    const clonedSubject = [...subject];
    const segment = computeSegment(subject, pointer[0]);
    clonedSubject[segment] = value;
    return clonedSubject;
  } else if (typeof subject === "object" && subject !== null) {
    return { ...subject, [pointer[0]]: value };
  } else {
    return applySegment(subject, pointer[0], cursor);
  }
};

const assign = (pointer, subject = undefined, value = undefined) => {
  const ptr = compile(pointer);
  const fn = curry((subject, value) => _assign(ptr, subject, value, nil));
  return subject === undefined ? fn : fn(subject, value);
};

const _assign = (pointer, subject, value, cursor) => {
  if (pointer.length === 0) {
    return;
  } else if (pointer.length === 1 && !isScalar(subject)) {
    const segment = computeSegment(subject, pointer[0]);
    subject[segment] = value;
  } else {
    const segment = pointer.shift();
    _assign(pointer, applySegment(subject, segment, cursor), value, append(segment, cursor));
  }
};

const unset = (pointer, subject = undefined) => {
  const ptr = compile(pointer);
  const fn = (subject) => _unset(ptr, subject, nil);
  return subject === undefined ? fn : fn(subject);
};

const _unset = (pointer, subject, cursor) => {
  if (pointer.length == 0) {
    return undefined;
  } else if (pointer.length > 1) {
    const segment = pointer.shift();
    const value = applySegment(subject, segment, cursor);
    return { ...subject, [segment]: _unset(pointer, value, append(segment, cursor)) };
  } else if (Array.isArray(subject)) {
    return subject.filter((_, ndx) => ndx != pointer[0]);
  } else if (typeof subject === "object" && subject !== null) {
    // eslint-disable-next-line no-unused-vars
    const { [pointer[0]]: _, ...result } = subject;
    return result;
  } else {
    return applySegment(subject, pointer[0], cursor);
  }
};

const remove = (pointer, subject = undefined) => {
  const ptr = compile(pointer);
  const fn = (subject) => _remove(ptr, subject, nil);
  return subject === undefined ? fn : fn(subject);
};

const _remove = (pointer, subject, cursor) => {
  if (pointer.length === 0) {
    return;
  } else if (pointer.length > 1) {
    const segment = pointer.shift();
    const value = applySegment(subject, segment, cursor);
    _remove(pointer, value, append(segment, cursor));
  } else if (Array.isArray(subject)) {
    subject.splice(pointer[0], 1);
  } else if (typeof subject === "object" && subject !== null) {
    delete subject[pointer[0]];
  } else {
    applySegment(subject, pointer[0], cursor);
  }
};

const append = curry((segment, pointer) => pointer + "/" + escape(segment));

const escape = (segment) => segment.toString().replace(/~/g, "~0").replace(/\//g, "~1");
const unescape = (segment) => segment.toString().replace(/~1/g, "/").replace(/~0/g, "~");
const computeSegment = (value, segment) => Array.isArray(value) && segment === "-" ? value.length : segment;

const applySegment = (value, segment, cursor = "") => {
  if (value === undefined) {
    throw TypeError(`Value at '${cursor}' is undefined and does not have property '${segment}'`);
  } else if (value === null) {
    throw TypeError(`Value at '${cursor}' is null and does not have property '${segment}'`);
  } else if (isScalar(value)) {
    throw TypeError(`Value at '${cursor}' is a ${typeof value} and does not have property '${segment}'`);
  } else {
    const computedSegment = computeSegment(value, segment);
    return value[computedSegment];
  }
};

const isScalar = (value) => value === null || typeof value !== "object";

module.exports = { nil, append, get, set, assign, unset, remove };
