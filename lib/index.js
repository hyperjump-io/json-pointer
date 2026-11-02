/** @import * as API from "./index.d.ts" */


/** @type API.nil */
export const nil = "";

/** @type API.pointerSegments */
export const pointerSegments = function* (pointer) {
  const hasEscapes = validatePointer(pointer);

  let segmentStart = 1;
  let segmentEnd = 0;

  while (segmentEnd < pointer.length) {
    const position = pointer.indexOf("/", segmentStart);
    segmentEnd = position === -1 ? pointer.length : position;
    const segment = pointer.slice(segmentStart, segmentEnd);
    segmentStart = segmentEnd + 1;

    yield hasEscapes ? unescape(segment) : segment;
  }
};

/**
 * Internally, pointers are parsed into an array of segments, which is much faster to work with than a generator.
 *
 * @type (pointer: string) => string[]
 */
const parse = (pointer) => {
  const hasEscapes = validatePointer(pointer);

  /** @type string[] */
  const segments = [];
  let segmentStart = 1;
  let segmentEnd = 0;

  while (segmentEnd < pointer.length) {
    const position = pointer.indexOf("/", segmentStart);
    segmentEnd = position === -1 ? pointer.length : position;
    const segment = pointer.slice(segmentStart, segmentEnd);
    segmentStart = segmentEnd + 1;

    segments.push(hasEscapes ? unescape(segment) : segment);
  }

  return segments;
};

/**
 * Throws if the pointer is invalid. Returns whether it has any escape sequences so segments that can't need
 * unescaping can skip it.
 *
 * @type (pointer: string) => boolean
 */
const validatePointer = (pointer) => {
  if (pointer.length > 0 && !pointer.startsWith("/")) {
    throw Error("Invalid JSON Pointer");
  }

  const hasEscapes = pointer.includes("~");
  if (hasEscapes && /~(?![01])/.test(pointer)) {
    throw Error("Invalid JSON Pointer");
  }

  return hasEscapes;
};

/**
 * The pointer to the location where a segment is applied. It's only needed for error messages, so it's built on
 * demand rather than while walking the pointer.
 *
 * @type (segments: string[], index: number) => string
 */
const cursorAt = (segments, index) => {
  /** @type string */
  let cursor = nil;
  for (let segmentIndex = 0; segmentIndex < index; segmentIndex++) {
    cursor = append(segments[segmentIndex], cursor);
  }

  return cursor;
};

/**
 * @overload
 * @param {string} pointer
 * @return {API.Getter}
 *
 * @overload
 * @param {string} pointer
 * @param {API.Json} subject
 * @return {API.Json | undefined}
 *
 * @param {string} pointer
 * @param {API.Json} [subject]
 * @return {API.Json | undefined | API.Getter}
 *
 * @type API.get
 */
export const get = (pointer, subject = undefined) => {
  const segments = parse(pointer);
  if (subject === undefined) {
    return (subject) => _get(segments, subject);
  } else {
    return _get(segments, subject);
  }
};

/** @type (segments: string[], subject: API.Json | undefined) => API.Json | undefined */
const _get = (segments, subject) => {
  for (let index = 0; index < segments.length; index++) {
    if (!isContainer(subject)) {
      throw notAContainerError(subject, segments[index], cursorAt(segments, index));
    }
    subject = getSegment(subject, segments[index]);
  }

  return subject;
};

/**
 * @overload
 * @param {string} pointer
 * @return {API.Setter}
 *
 * @overload
 * @param {string} pointer
 * @param {API.Json} subject
 * @param {API.Json} value
 * @return {API.Json}
 *
 * @param {string} pointer
 * @param {API.Json} [subject]
 * @param {API.Json} [value]
 * @return {API.Json | API.Setter}
 *
 * @type API.set
 */
export const set = (pointer, subject = undefined, value = undefined) => {
  if (subject === undefined) {
    // Parsed on first use so an invalid pointer throws when the setter is called, not when it's created
    /** @type string[] | undefined */
    let segments;
    return (subject, value) => _set(segments ??= parse(pointer), 0, subject, value);
  } else {
    return _set(parse(pointer), 0, subject, /** @type API.Json */ (value));
  }
};

/** @type (segments: string[], index: number, subject: API.Json | undefined, value: API.Json) => API.Json */
const _set = (segments, index, subject, value) => {
  if (index === segments.length) {
    return value;
  }

  const segment = segments[index];
  if (Array.isArray(subject)) {
    subject = [...subject];
  } else if (typeof subject === "object" && subject !== null) {
    subject = { ...subject };
  } else {
    throw notAContainerError(subject, segment, cursorAt(segments, index));
  }

  // currentSubject could also be an array, but this appeases the type system
  const currentSubject = /** @type API.JsonObject */ (subject);
  const computedSegment = computeSegment(subject, segment, cursorAt(segments, index));
  currentSubject[computedSegment] = _set(segments, index + 1, currentSubject[computedSegment], value);
  return currentSubject;
};

/**
 * @overload
 * @param {string} pointer
 * @returns {API.Assigner}
 *
 * @overload
 * @param {string} pointer
 * @param {API.Json} subject
 * @param {API.Json} value
 * @returns {void}
 *
 * @param {string} pointer
 * @param {API.Json} [subject]
 * @param {API.Json} [value]
 * @returns {void | API.Assigner}
 *
 * @type API.assign
 */
export const assign = (pointer, subject = undefined, value = undefined) => {
  if (subject === undefined) {
    // Parsed on first use so an invalid pointer throws when the assigner is called, not when it's created
    /** @type string[] | undefined */
    let segments;
    return (subject, value) => _assign(segments ??= parse(pointer), subject, value);
  } else {
    return _assign(parse(pointer), subject, /** @type API.Json */ (value));
  }
};

/** @type (segments: string[], subject: API.Json, value: API.Json, cursor?: string) => void */
const _assign = (segments, subject, value, cursor = nil) => {
  /** @type string | undefined */
  let lastSegment;

  /** @type API.Json | undefined */
  let currentSubject = subject;

  /** @type API.Json | undefined */
  let lastSubject;

  for (let segment of segments) {
    segment = computeSegment(currentSubject, segment, cursor);
    lastSegment = segment;
    lastSubject = currentSubject;
    currentSubject = applySegment(currentSubject, segment, cursor);
    cursor = append(segment, cursor);
  }

  if (lastSegment === undefined) {
    return;
  }

  // lastSubject could also be an array, but this appeases the type system
  /** @type API.JsonObject */ (lastSubject)[lastSegment] = value;
};

/**
 * @overload
 * @param {string} pointer
 * @returns {API.Unsetter}
 *
 * @overload
 * @param {string} pointer
 * @param {API.Json} subject
 * @returns {API.Json | undefined}
 *
 * @param {string} pointer
 * @param {API.Json} [subject]
 * @returns {API.Json | undefined | API.Unsetter}
 *
 * @type API.unset
 */
export const unset = (pointer, subject = undefined) => {
  if (subject === undefined) {
    // Parsed on first use so an invalid pointer throws when the unsetter is called, not when it's created
    /** @type string[] | undefined */
    let segments;
    return (subject) => _unset(segments ??= parse(pointer), 0, subject);
  } else {
    return _unset(parse(pointer), 0, subject);
  }
};

/**
 * @param {string[]} segments
 * @param {number} index
 * @param {API.Json | undefined} [subject]
 * @returns {API.JsonObject | API.Json[] | undefined}
 */
const _unset = (segments, index, subject) => {
  if (index === segments.length) {
    return;
  }

  const segment = segments[index];
  if (Array.isArray(subject)) {
    subject = [...subject];
  } else if (typeof subject === "object" && subject !== null) {
    subject = { ...subject };
  } else {
    throw notAContainerError(subject, segment, cursorAt(segments, index));
  }

  // currentSubject could also be an array, but this appeases the type system
  const currentSubject = /** @type API.JsonObject */ (subject);
  const unsetSubject = _unset(segments, index + 1, getSegment(currentSubject, segment));
  if (hasSegment(currentSubject, segment)) {
    if (unsetSubject === undefined) {
      delete currentSubject[segment];
    } else {
      currentSubject[segment] = unsetSubject;
    }
  }
  return currentSubject;
};

/**
 * @overload
 * @param {string} pointer
 * @returns {API.Remover}
 *
 * @overload
 * @param {string} pointer
 * @param {API.Json} subject
 * @returns {void}
 *
 * @param {string} pointer
 * @param {API.Json} [subject]
 * @returns {void | API.Remover}
 *
 * @type API.remove
 */
export const remove = (pointer, subject = undefined) => {
  if (subject === undefined) {
    // Parsed on first use so an invalid pointer throws when the remover is called, not when it's created
    /** @type string[] | undefined */
    let segments;
    return (subject) => _remove(segments ??= parse(pointer), subject);
  } else {
    return _remove(parse(pointer), subject);
  }
};

/** @type (segments: string[], subject: API.Json, cursor?: string) => void */
const _remove = (segments, subject, cursor = nil) => {
  /** @type string | undefined */
  let lastSegment;

  /** @type API.Json | undefined */
  let currentSubject = subject;

  /** @type API.Json | undefined */
  let lastSubject;

  for (const segment of segments) {
    lastSegment = segment;
    lastSubject = currentSubject;
    currentSubject = applySegment(currentSubject, segment, cursor);
    cursor = append(segment, cursor);
  }

  if (lastSegment === undefined) {
    return;
  }

  // lastSubject could also be an array, but this appeases the type system
  const container = /** @type API.JsonObject */ (lastSubject);
  if (hasSegment(container, lastSegment)) {
    delete container[lastSegment];
  }
};

/** @type API.append */
export const append = (segment, pointer) => pointer + "/" + escape(segment);

// Most segments don't need escaping or unescaping, so the replacements are skipped when there's nothing to replace

/** @type (segment: string) => string */
const escape = (segment) => {
  segment = segment.toString();
  return segment.includes("~") || segment.includes("/")
    ? segment.replace(/~/g, "~0").replace(/\//g, "~1")
    : segment;
};

/** @type (segment: string) => string */
const unescape = (segment) => {
  return segment.includes("~")
    ? segment.replace(/~1/g, "/").replace(/~0/g, "~")
    : segment;
};

/**
 * @overload
 * @param {API.Json[]} value
 * @param {string} segment
 * @param {string} cursor
 * @returns {number}
 *
 * @overload
 * @param {API.Json | undefined} value
 * @param {string} segment
 * @param {string} cursor
 * @returns {string}
 *
 * @param {API.Json | undefined} value
 * @param {string} segment
 * @param {string} cursor
 * @returns {string | number}
 */
const computeSegment = (value, segment, cursor) => {
  if (!Array.isArray(value)) {
    return segment;
  }

  if (segment === "-") {
    return value.length;
  }

  if (!/^(?:0|[1-9][0-9]*)$/.test(segment)) {
    throw TypeError(`Value at '${cursor}' is an array and '${segment}' is not a valid array index`);
  }

  return Number(segment);
};

/** @type (value: API.Json | undefined, segment: string, cursor?: string) => API.Json | undefined */
const applySegment = (value, segment, cursor = "") => {
  if (!isContainer(value)) {
    throw notAContainerError(value, segment, cursor);
  }

  return getSegment(value, segment);
};

/** @type (value: API.JsonObject | API.Json[], segment: string) => API.Json | undefined */
const getSegment = (value, segment) => {
  if (hasSegment(value, segment)) {
    // value could also be an array, but this appeases the type system
    return /** @type API.JsonObject */ (value)[segment];
  }
};

/** @type (value: API.JsonObject | API.Json[], segment: string) => boolean */
const hasSegment = (value, segment) => Object.prototype.propertyIsEnumerable.call(value, segment);

/** @type (value: API.Json | undefined) => value is API.JsonObject | API.Json[] */
const isContainer = (value) => typeof value === "object" && value !== null;

/** @type (value: API.Json | undefined, segment: string, cursor: string) => TypeError */
const notAContainerError = (value, segment, cursor) => {
  if (value === undefined) {
    return TypeError(`Value at '${cursor}' is undefined and does not have property '${segment}'`);
  } else if (value === null) {
    return TypeError(`Value at '${cursor}' is null and does not have property '${segment}'`);
  } else {
    return TypeError(`Value at '${cursor}' is a ${typeof value} and does not have property '${segment}'`);
  }
};
