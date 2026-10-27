/** @import * as API from "./index.d.ts" */

/** @typedef {API.JsonObject | API.Json[]} Container */

/** The largest array index in JavaScript. A larger number is an ordinary property. */
const MAX_INDEX = 2 ** 32 - 2;

/** @type typeof API.nil */
export const nil = "";

/** @type typeof API.parse */
export const parse = (pointer) => {
  if (pointer.length > 0 && !pointer.startsWith("/")) {
    throw new InvalidPointerError(pointer);
  }

  // Most pointers have no escapes, so the check and the unescaping are skipped for them
  const hasEscapes = pointer.includes("~");
  if (hasEscapes && /~(?![01])/.test(pointer)) {
    throw new InvalidPointerError(pointer);
  }

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

/** @type typeof API.stringify */
export const stringify = (segments) => {
  /** @type string */
  let pointer = nil;
  for (const segment of segments) {
    pointer = append(segment, pointer);
  }

  return pointer;
};

/** @type typeof API.append */
export const append = (segment, pointer) => pointer + "/" + escape(segment);

// Each function is curried when it's given only a pointer. It's told by the number of arguments, not by whether
// subject is undefined, so a subject that's missing by mistake throws instead of returning a function.

/**
 * @param {API.Pointer} pointer
 * @param {API.Json} [subject]
 */
export const get = function (pointer, subject) {
  const segments = toSegments(pointer);
  if (arguments.length === 1) {
    return (/** @type API.Json */ subject) => _get(segments, subject);
  } else {
    return _get(segments, subject);
  }
};

/**
 * @param {API.Pointer} pointer
 * @param {API.Json} [subject]
 * @param {API.Json} [value]
 */
export const set = function (pointer, subject, value) {
  const segments = toSegments(pointer);
  if (arguments.length === 1) {
    return (/** @type API.Json */ subject, /** @type API.Json */ value) => _set(segments, subject, value);
  } else {
    return _set(segments, subject, value);
  }
};

/**
 * @param {API.Pointer} pointer
 * @param {API.Json} [subject]
 * @param {API.Json} [value]
 */
export const assign = function (pointer, subject, value) {
  const segments = toSegments(pointer);
  if (arguments.length === 1) {
    return (/** @type API.Json */ subject, /** @type API.Json */ value) => _assign(segments, subject, value);
  } else {
    return _assign(segments, subject, value);
  }
};

/**
 * @param {API.Pointer} pointer
 * @param {API.Json} [subject]
 */
export const unset = function (pointer, subject) {
  const segments = toSegments(pointer);
  if (arguments.length === 1) {
    return (/** @type API.Json */ subject) => _unset(segments, subject);
  } else {
    return _unset(segments, subject);
  }
};

/**
 * @param {API.Pointer} pointer
 * @param {API.Json} [subject]
 */
export const remove = function (pointer, subject) {
  const segments = toSegments(pointer);
  if (arguments.length === 1) {
    return (/** @type API.Json */ subject) => _remove(segments, subject);
  } else {
    return _remove(segments, subject);
  }
};

export class InvalidPointerError extends Error {
  /** @param {string} pointer */
  constructor(pointer) {
    super(`Invalid JSON Pointer: '${pointer}'`);
    this.name = "InvalidPointerError";

    /** @readonly */
    this.pointer = pointer;
  }
}

export class NotAContainerError extends TypeError {
  /**
   * @param {string} pointer
   * @param {string} location
   * @param {string} segment
   * @param {API.Json | undefined} value
   */
  constructor(pointer, location, segment, value) {
    super(`Value at '${location}' is ${describe(value)} and does not have property '${segment}'`);
    this.name = "NotAContainerError";

    /** @readonly */
    this.pointer = pointer;

    /** @readonly */
    this.location = location;

    /** @readonly */
    this.segment = segment;
  }
}

export class InvalidIndexError extends TypeError {
  /**
   * @param {string} pointer
   * @param {string} location
   * @param {string} segment
   */
  constructor(pointer, location, segment) {
    super(`Value at '${location}' is an array and '${segment}' isn't an index`);
    this.name = "InvalidIndexError";

    /** @readonly */
    this.pointer = pointer;

    /** @readonly */
    this.location = location;

    /** @readonly */
    this.segment = segment;
  }
}

/** @type (pointer: API.Pointer) => API.Segments */
const toSegments = (pointer) => typeof pointer === "string" ? parse(pointer) : pointer;

/** @type (segments: API.Segments, subject: API.Json | undefined) => API.Json | undefined */
const _get = (segments, subject) => {
  for (let index = 0; index < segments.length; index++) {
    subject = child(segments, index, container(segments, index, subject));
  }

  return subject;
};

/**
 * `value` is undefined only when it's left out, which sets `undefined`, like JavaScript does.
 *
 * @type (segments: API.Segments, subject: API.Json | undefined, value: API.Json | undefined, index?: number) => API.Json | undefined
 */
const _set = (segments, subject, value, index = 0) => {
  if (index === segments.length) {
    return value;
  }

  const copy = shallowCopy(container(segments, index, subject));
  const key = keyOf(segments, index, copy);
  const current = isOwn(copy, key) ? /** @type API.JsonObject */ (copy)[key] : undefined;
  define(copy, key, _set(segments, current, value, index + 1));

  return copy;
};

/** @type (segments: API.Segments, subject: API.Json | undefined, value: API.Json | undefined) => void */
const _assign = (segments, subject, value) => {
  if (segments.length === 0) {
    return;
  }

  const parent = walkToParent(segments, subject);
  define(parent, keyOf(segments, segments.length - 1, parent), value);
};

/**
 * Returns `subject` itself when there's nothing to remove, so callers can tell nothing changed with `===`.
 *
 * @type (segments: API.Segments, subject: API.Json | undefined, index?: number) => API.Json | undefined
 */
const _unset = (segments, subject, index = 0) => {
  if (segments.length === 0) {
    return undefined;
  }

  const parent = container(segments, index, subject);
  const key = keyOf(segments, index, parent);

  if (index === segments.length - 1) {
    if (!isOwn(parent, key)) {
      return parent;
    }

    const copy = shallowCopy(parent);
    delete (/** @type API.JsonObject */ (copy))[key];
    return copy;
  }

  const current = isOwn(parent, key) ? /** @type API.JsonObject */ (parent)[key] : undefined;
  const unset = _unset(segments, current, index + 1);
  if (unset === current) {
    return parent;
  }

  const copy = shallowCopy(parent);
  define(copy, key, unset);
  return copy;
};

/** @type (segments: API.Segments, subject: API.Json | undefined) => void */
const _remove = (segments, subject) => {
  if (segments.length === 0) {
    return;
  }

  const parent = walkToParent(segments, subject);
  const key = keyOf(segments, segments.length - 1, parent);
  if (isOwn(parent, key)) {
    delete (/** @type API.JsonObject */ (parent))[key];
  }
};

/**
 * The object or array the last segment applies to.
 *
 * @type (segments: API.Segments, subject: API.Json | undefined) => Container
 */
const walkToParent = (segments, subject) => {
  const last = segments.length - 1;
  for (let index = 0; index < last; index++) {
    subject = child(segments, index, container(segments, index, subject));
  }

  return container(segments, last, subject);
};

/**
 * The value the segment at `index` names in `parent`, if it's there.
 *
 * @type (segments: API.Segments, index: number, parent: Container) => API.Json | undefined
 */
const child = (segments, index, parent) => {
  const key = keyOf(segments, index, parent);
  return isOwn(parent, key) ? /** @type API.JsonObject */ (parent)[key] : undefined;
};

/**
 * Throws if the segment at `index` can't be applied to `value` because it isn't an object or an array.
 *
 * @type (segments: API.Segments, index: number, value: API.Json | undefined) => Container
 */
const container = (segments, index, value) => {
  if (typeof value !== "object" || value === null) {
    throw new NotAContainerError(stringify(segments), stringify(segments.slice(0, index)), segments[index], value);
  }

  return value;
};

/**
 * The key the segment at `index` names in `parent`. In an array, it has to be an index or `-`, which is the
 * position after the last item.
 *
 * @type (segments: API.Segments, index: number, parent: Container) => string | number
 */
const keyOf = (segments, index, parent) => {
  const segment = segments[index];
  if (!Array.isArray(parent)) {
    return segment;
  } else if (segment === "-") {
    return parent.length;
  } else if (isIndex(segment)) {
    return Number(segment);
  } else {
    throw new InvalidIndexError(stringify(segments), stringify(segments.slice(0, index)), segment);
  }
};

/** @type (segment: string) => boolean */
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
 * Only own properties are there, not inherited ones. Own and enumerable would match `JSON.stringify` exactly, but
 * only differs for properties `JSON.parse` never makes, and checking enumerability was 1.3x slower.
 *
 * @type (value: Container, key: string | number) => boolean
 */
const isOwn = (value, key) => Object.hasOwn(value, key);

/**
 * Copies an array with `slice` so holes stay holes, and an object with spread, which keeps an own `__proto__`
 * as an own property.
 *
 * @type (value: Container) => Container
 */
const shallowCopy = (value) => Array.isArray(value) ? value.slice() : { ...value };

/**
 * Assigning to `__proto__` would change the prototype, so it's defined as an own property, like `JSON.parse`
 * does.
 *
 * @type (target: Container, key: string | number, value: API.Json | undefined) => void
 */
const define = (target, key, value) => {
  if (key === "__proto__") {
    Object.defineProperty(target, key, { value, writable: true, enumerable: true, configurable: true });
  } else {
    /** @type Record<string | number, API.Json | undefined> */ (target)[key] = value;
  }
};

/** @type (value: API.Json | undefined) => string */
const describe = (value) => {
  if (value === undefined || value === null) {
    return String(value);
  } else {
    return `a ${typeof value}`;
  }
};

// Most segments don't need escaping or unescaping, so the replacements are skipped when there's nothing to replace

/** @type (segment: string) => string */
const escape = (segment) => {
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
