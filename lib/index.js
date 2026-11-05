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
    subject = child(container(segments, index, subject), segments[index]);
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

  // copy could also be an array, but this appeases the type system
  const copy = /** @type API.JsonObject */ (shallowCopy(container(segments, index, subject)));
  const key = writeKey(segments, index, copy);
  // Only own properties are followed, like get, because RFC 6901 only references an object's members
  const current = Object.hasOwn(copy, key) ? copy[key] : undefined;
  copy[key] = _set(segments, index + 1, current, value);

  return copy;
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

/** @type (segments: string[], subject: API.Json, value: API.Json) => void */
const _assign = (segments, subject, value) => {
  if (segments.length === 0) {
    return;
  }

  /** @type API.Json | undefined */
  let current = subject;
  const last = segments.length - 1;
  for (let index = 0; index < last; index++) {
    const parent = container(segments, index, current);
    const key = writeKey(segments, index, parent);
    current = Object.hasOwn(parent, key) ? /** @type API.JsonObject */ (parent)[key] : undefined;
  }

  // parent could also be an array, but this appeases the type system
  const parent = /** @type API.JsonObject */ (container(segments, last, current));
  parent[writeKey(segments, last, parent)] = value;
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

  const copy = shallowCopy(container(segments, index, subject));
  const key = readKey(copy, segments[index]);
  const exists = key !== undefined && Object.hasOwn(copy, key);
  const unsetSubject = _unset(segments, index + 1, exists ? /** @type API.JsonObject */ (copy)[key] : undefined);
  if (exists) {
    if (unsetSubject === undefined) {
      delete (/** @type API.JsonObject */ (copy))[key];
    } else {
      /** @type API.JsonObject */ (copy)[key] = unsetSubject;
    }
  }

  return copy;
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

/** @type (segments: string[], subject: API.Json) => void */
const _remove = (segments, subject) => {
  if (segments.length === 0) {
    return;
  }

  /** @type API.Json | undefined */
  let current = subject;
  const last = segments.length - 1;
  for (let index = 0; index < last; index++) {
    current = child(container(segments, index, current), segments[index]);
  }

  const parent = container(segments, last, current);
  const key = readKey(parent, segments[last]);
  if (key !== undefined && Object.hasOwn(parent, key)) {
    delete (/** @type API.JsonObject */ (parent))[key];
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

/** @typedef {API.JsonObject | API.Json[]} Container */

/**
 * Throws if the segment at `index` can't be applied to `value` because it isn't an object or an array.
 *
 * @type (segments: string[], index: number, value: API.Json | undefined) => Container
 */
const container = (segments, index, value) => {
  if (typeof value !== "object" || value === null) {
    throw notAContainerError(value, segments[index], cursorAt(segments, index));
  }

  return value;
};

/**
 * The value `segment` names in `parent`, if it's there. Only own properties are there, not inherited ones.
 *
 * @type (parent: Container, segment: string) => API.Json | undefined
 */
const child = (parent, segment) => {
  const key = readKey(parent, segment);
  return key !== undefined && Object.hasOwn(parent, key) ? /** @type API.JsonObject */ (parent)[key] : undefined;
};

/**
 * The key `segment` names in `parent` when reading or deleting. In an array, a segment that isn't an index names
 * nothing, like `arr["01"]` in JavaScript, so it's `undefined`. That includes `-` and `length`.
 *
 * @type (parent: Container, segment: string) => string | number | undefined
 */
const readKey = (parent, segment) => {
  if (!Array.isArray(parent)) {
    return segment;
  }

  return isIndex(segment) ? Number(segment) : undefined;
};

/**
 * The key the segment at `index` names in `parent` when writing. In an array, it has to be an index or `-`, which
 * is the position after the last item. Anything else would be a property `JSON.stringify` drops, so it throws.
 *
 * @type (segments: string[], index: number, parent: Container) => string | number
 */
const writeKey = (segments, index, parent) => {
  const segment = segments[index];
  if (!Array.isArray(parent)) {
    return segment;
  } else if (segment === "-") {
    return parent.length;
  } else if (isIndex(segment)) {
    return Number(segment);
  } else {
    throw TypeError(`Value at '${cursorAt(segments, index)}' is an array and '${segment}' is not a valid array index`);
  }
};

/** The largest array index in JavaScript. A larger number is an ordinary property, which `JSON.stringify` drops. */
const MAX_INDEX = 2 ** 32 - 2;

/**
 * `0` or digits without a leading `0`, up to `MAX_INDEX`. A character loop, because it's faster than a regex.
 *
 * @type (segment: string) => boolean
 */
const isIndex = (segment) => {
  const length = segment.length;
  if (length === 0 || length > 10 || (segment.charCodeAt(0) === 48 && length > 1)) {
    return false;
  }

  for (let index = 0; index < length; index++) {
    const code = segment.charCodeAt(index);
    if (code < 48 || code > 57) {
      return false;
    }
  }

  return length < 10 || Number(segment) <= MAX_INDEX;
};

/**
 * Copies an array with `slice` so holes stay holes, like changing the array in place does.
 *
 * @type (value: Container) => Container
 */
const shallowCopy = (value) => Array.isArray(value) ? value.slice() : { ...value };

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
