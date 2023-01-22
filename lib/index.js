const curry = require("just-curry-it");


const nil = "";

const EXISTS = Symbol("EXISTS");

const segmentGenerator = (pointer) => {
  if (pointer.length > 0 && pointer[0] !== "/") {
    throw Error("Invalid JSON Pointer");
  }

  let segmentStart = 1;
  let segmentEnd = 0;

  return (mode) => {
    if (mode === EXISTS) {
      return segmentEnd < pointer.length;
    }

    if (segmentEnd >= pointer.length) {
      return;
    }

    const position = pointer.indexOf("/", segmentStart);
    segmentEnd = position === -1 ? pointer.length : position;
    const segment = unescape(pointer.slice(segmentStart, segmentEnd));
    segmentStart = segmentEnd + 1;

    return segment;
  };
};

const get = (pointer, subject = undefined) => {
  const nextSegment = segmentGenerator(pointer);
  const fn = (subject) => _get(nextSegment, subject, nil);
  return subject === undefined ? fn : fn(subject);
};

const _get = (nextSegment, subject, cursor) => {
  if (!nextSegment(EXISTS)) {
    return subject;
  } else {
    const segment = nextSegment();
    return _get(nextSegment, applySegment(subject, segment, cursor), append(segment, cursor));
  }
};

const set = (pointer, subject = undefined, value = undefined) => {
  const nextSegment = segmentGenerator(pointer);
  const fn = curry((subject, value) => _set(nextSegment, subject, value, nil));
  return subject === undefined ? fn : fn(subject, value);
};

const _set = (nextSegment, subject, value, cursor) => {
  const segment = nextSegment();
  if (segment === undefined) {
    return value;
  } else if (nextSegment(EXISTS)) {
    if (Array.isArray(subject)) {
      const clonedSubject = [...subject];
      clonedSubject[segment] = _set(nextSegment, applySegment(subject, segment, cursor), value, append(segment, cursor));
      return clonedSubject;
    } else {
      return { ...subject, [segment]: _set(nextSegment, applySegment(subject, segment, cursor), value, append(segment, cursor)) };
    }
  } else if (Array.isArray(subject)) {
    const clonedSubject = [...subject];
    clonedSubject[computeSegment(subject, segment)] = value;
    return clonedSubject;
  } else if (typeof subject === "object" && subject !== null) {
    return { ...subject, [segment]: value };
  } else {
    return applySegment(subject, segment, cursor);
  }
};

const assign = (pointer, subject = undefined, value = undefined) => {
  const nextSegment = segmentGenerator(pointer);
  const fn = curry((subject, value) => _assign(nextSegment, subject, value, nil));
  return subject === undefined ? fn : fn(subject, value);
};

const _assign = (nextSegment, subject, value, cursor) => {
  const segment = nextSegment();
  if (segment === undefined) {
    return;
  } else if (!nextSegment(EXISTS) && !isScalar(subject)) {
    subject[computeSegment(subject, segment)] = value;
  } else {
    _assign(nextSegment, applySegment(subject, segment, cursor), value, append(segment, cursor));
  }
};

const unset = (pointer, subject = undefined) => {
  const nextSegment = segmentGenerator(pointer);
  const fn = (subject) => _unset(nextSegment, subject, nil);
  return subject === undefined ? fn : fn(subject);
};

const _unset = (nextSegment, subject, cursor) => {
  const segment = nextSegment();
  if (segment === undefined) {
    return;
  } else if (nextSegment(EXISTS)) {
    const value = applySegment(subject, segment, cursor);
    return { ...subject, [segment]: _unset(nextSegment, value, append(segment, cursor)) };
  } else if (Array.isArray(subject)) {
    const clonedSubject = [...subject];
    delete clonedSubject[computeSegment(subject, segment)];
    return clonedSubject;
  } else if (typeof subject === "object" && subject !== null) {
    // eslint-disable-next-line no-unused-vars
    const { [segment]: _, ...result } = subject;
    return result;
  } else {
    return applySegment(subject, segment, cursor);
  }
};

const remove = (pointer, subject = undefined) => {
  const nextSegment = segmentGenerator(pointer);
  const fn = (subject) => _remove(nextSegment, subject, nil);
  return subject === undefined ? fn : fn(subject);
};

const _remove = (nextSegment, subject, cursor) => {
  const segment = nextSegment();
  if (segment === undefined) {
    return;
  } else if (nextSegment(EXISTS)) {
    const value = applySegment(subject, segment, cursor);
    _remove(nextSegment, value, append(segment, cursor));
  } else if (!isScalar(subject)) {
    delete subject[segment];
  } else {
    applySegment(subject, segment, cursor);
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
