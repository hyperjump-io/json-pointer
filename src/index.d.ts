export type Json = string | number | boolean | null | JsonObject | Json[];
export type JsonObject = {
  [property: string]: Json;
};

/**
 * A JSON value that can't be changed, like one declared `as const`. `get`,
 * `set`, and `unset` take one, because they don't change their subject.
 * Every {@link Json} is a `ReadonlyJson`.
 */
export type ReadonlyJson = string | number | boolean | null | ReadonlyJsonObject | readonly ReadonlyJson[];
export type ReadonlyJsonObject = {
  readonly [property: string]: ReadonlyJson;
};

/**
 * A pointer parsed into its segments, unescaped. `["foo", "a/b"]` is the
 * pointer `/foo/a~1b`. Any list of strings is a valid pointer.
 */
export type Segments = readonly string[];

/**
 * A pointer, as a string like `/foo/0`, or as its {@link Segments}. A string
 * is parsed and validated. Segments are used as they are.
 */
export type Pointer = string | Segments;

/** The empty pointer, `""`, which is the whole document. */
export const nil: "";

/**
 * Splits a pointer into its segments, unescaping `~1` to `/` and `~0` to
 * `~`. The empty pointer has no segments.
 *
 * @throws {InvalidPointerError} If the pointer isn't empty and doesn't
 *   start with `/`, or it has a `~` that isn't followed by `0` or `1`.
 */
export const parse: (pointer: string) => string[];

/**
 * Joins segments into a pointer, escaping `~` as `~0` and `/` as `~1`. No
 * segments is the empty pointer.
 */
export const stringify: (segments: Segments) => string;

/**
 * Adds a segment to the end of a pointer, escaping it. The segment comes
 * first, then the pointer it's added to.
 */
export const append: (segment: string, pointer: string) => string;

/**
 * Returns the value the pointer identifies in `subject`. It's the value in
 * `subject`, not a copy.
 *
 * Returns `undefined` if the last segment names a property or item that
 * isn't there. Only own properties are found, not inherited ones. `-` in an
 * array is never there.
 *
 * Given only a pointer, it parses the pointer and returns a function that
 * takes the subject.
 *
 * @throws {InvalidPointerError} If the pointer is invalid. The curried form
 *   throws when it's given the pointer.
 * @throws {NotAContainerError} If a segment before the last doesn't lead to
 *   an object or an array.
 * @throws {InvalidIndexError} If a segment applied to an array isn't an
 *   index or `-`.
 */
export const get: {
  <T extends ReadonlyJson>(pointer: Pointer, subject: T): Shared<T> | undefined;
  (pointer: Pointer): Getter;
};
export type Getter = <T extends ReadonlyJson>(subject: T) => Shared<T> | undefined;

/**
 * A value that's part of a `T`, or shares parts of one: {@link ReadonlyJson}
 * if any of `T` is, otherwise {@link Json}.
 */
export type Shared<T extends ReadonlyJson> = [T] extends [Json] ? Json : ReadonlyJson;

/**
 * Returns a copy of `subject` with `value` at the pointer. `subject` isn't
 * changed. Only the objects and arrays on the way to the value are copied,
 * and everything else is shared with `subject`. If `subject` or `value` is
 * a {@link ReadonlyJson}, so is the result, because it shares them.
 *
 * The property or item is added if it isn't there, but what it's added to
 * has to exist. In an array, `-` adds an item to the end, and an index past
 * the end leaves holes before it. With the empty pointer, it returns
 * `value`.
 *
 * Given only a pointer, it parses the pointer and returns a function that
 * takes the subject and the value.
 *
 * @throws {InvalidPointerError} If the pointer is invalid. The curried form
 *   throws when it's given the pointer.
 * @throws {NotAContainerError} If a segment before the last doesn't lead to
 *   an object or an array.
 * @throws {InvalidIndexError} If a segment applied to an array isn't an
 *   index or `-`.
 */
export const set: {
  <T extends ReadonlyJson, V extends ReadonlyJson>(pointer: Pointer, subject: T, value: V): Shared<T | V>;
  (pointer: Pointer): Setter;
};
export type Setter = <T extends ReadonlyJson, V extends ReadonlyJson>(subject: T, value: V) => Shared<T | V>;

/**
 * Sets `value` at the pointer in `subject`, in place.
 *
 * The property or item is added if it isn't there, but what it's added to
 * has to exist. In an array, `-` adds an item to the end, and an index past
 * the end leaves holes before it. With the empty pointer, it does nothing,
 * because a value can't replace itself in place.
 *
 * Given only a pointer, it parses the pointer and returns a function that
 * takes the subject and the value.
 *
 * @throws {InvalidPointerError} If the pointer is invalid. The curried form
 *   throws when it's given the pointer.
 * @throws {NotAContainerError} If a segment before the last doesn't lead to
 *   an object or an array.
 * @throws {InvalidIndexError} If a segment applied to an array isn't an
 *   index or `-`.
 */
export const assign: {
  (pointer: Pointer, subject: Json, value: Json): void;
  (pointer: Pointer): Assigner;
};
export type Assigner = (subject: Json, value: Json) => void;

/**
 * Returns a copy of `subject` without the value at the pointer. `subject`
 * isn't changed. Only the objects and arrays on the way to the value are
 * copied, and everything else is shared with `subject`. If `subject` is a
 * {@link ReadonlyJson}, so is the result.
 *
 * If the value isn't there, it returns `subject` itself. Removing an array
 * item leaves a hole, and the items after it don't move. With the empty
 * pointer, it returns `undefined`.
 *
 * Given only a pointer, it parses the pointer and returns a function that
 * takes the subject.
 *
 * @throws {InvalidPointerError} If the pointer is invalid. The curried form
 *   throws when it's given the pointer.
 * @throws {NotAContainerError} If a segment before the last doesn't lead to
 *   an object or an array.
 * @throws {InvalidIndexError} If a segment applied to an array isn't an
 *   index or `-`.
 */
export const unset: {
  <T extends ReadonlyJson>(pointer: Pointer, subject: T): Shared<T> | undefined;
  (pointer: Pointer): Unsetter;
};
export type Unsetter = <T extends ReadonlyJson>(subject: T) => Shared<T> | undefined;

/**
 * Removes the value at the pointer from `subject`, in place.
 *
 * If the value isn't there, nothing is removed. Removing an array item
 * leaves a hole, and the items after it don't move. With the empty pointer,
 * it does nothing, because a value can't remove itself in place.
 *
 * Given only a pointer, it parses the pointer and returns a function that
 * takes the subject.
 *
 * @throws {InvalidPointerError} If the pointer is invalid. The curried form
 *   throws when it's given the pointer.
 * @throws {NotAContainerError} If a segment before the last doesn't lead to
 *   an object or an array.
 * @throws {InvalidIndexError} If a segment applied to an array isn't an
 *   index or `-`.
 */
export const remove: {
  (pointer: Pointer, subject: Json): void;
  (pointer: Pointer): Remover;
};
export type Remover = (subject: Json) => void;

/**
 * The pointer isn't empty and doesn't start with `/`, or it has a `~` that
 * isn't followed by `0` or `1`.
 */
export class InvalidPointerError extends Error {
  /** The invalid pointer. */
  readonly pointer: string;

  private constructor();
}

/**
 * A segment before the last doesn't lead to an object or an array, so
 * there's nothing to apply the next segment to.
 */
export class NotAContainerError extends TypeError {
  /** The pointer that was given, as a string. */
  readonly pointer: string;

  /** The pointer to the value that isn't an object or an array. */
  readonly location: string;

  /** The segment that couldn't be applied, unescaped. */
  readonly segment: string;

  private constructor();
}

/**
 * A segment applied to an array isn't an index or `-`. An index is `0`, or
 * a number without leading zeros up to `4294967294` (`2**32 - 2`).
 */
export class InvalidIndexError extends TypeError {
  /** The pointer that was given, as a string. */
  readonly pointer: string;

  /** The pointer to the array. */
  readonly location: string;

  /** The segment that isn't an index, unescaped. */
  readonly segment: string;

  private constructor();
}
