export type Json = string | number | boolean | null | JsonObject | Json[];
export type JsonObject = {
  [property: string]: Json;
};

/**
 * A JSON value that can't be changed, like one declared `as const`.
 * `pointerGet`, `pointerSet`, and `pointerUnset` take one, because they
 * don't change their subject.
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
export type PointerSegments = readonly string[];

/**
 * A pointer, as a string like `/foo/0`, or as its {@link PointerSegments}. A
 * string is parsed and validated. Segments are used as they are.
 */
export type Pointer = string | PointerSegments;

/**
 * Splits a pointer into its segments, unescaping `~1` to `/` and `~0` to
 * `~`. The empty pointer has no segments.
 *
 * @throws {InvalidPointerError} If the pointer isn't empty and doesn't
 *   start with `/`, or it has a `~` that isn't followed by `0` or `1`.
 */
export const pointerParse: (pointer: string) => string[];

/**
 * Joins segments into a pointer, escaping `~` as `~0` and `/` as `~1`. No
 * segments is the empty pointer.
 */
export const pointerStringify: (segments: PointerSegments) => string;

/**
 * Adds a segment to the end of a pointer, escaping it. The segment comes
 * first, then the pointer it's added to.
 */
export const pointerAppend: (segment: string, pointer: string) => string;

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
export const pointerGet: {
  <T extends ReadonlyJson>(pointer: Pointer, subject: T): Shared<T> | undefined;
  (pointer: Pointer): PointerGetter;
};
export type PointerGetter = <T extends ReadonlyJson>(subject: T) => Shared<T> | undefined;

/**
 * A value that's part of a `T`: {@link ReadonlyJson} if any of `T` is,
 * otherwise {@link Json}.
 */
export type Shared<T extends ReadonlyJson> = [T] extends [Json] ? Json : ReadonlyJson;

/**
 * Returns a copy of `subject` with `value` at the pointer. `subject` isn't
 * changed. Only the objects and arrays on the way to the value are copied,
 * and everything else is shared with `subject`.
 *
 * The result has `subject`'s type. A pointer is a string, so TypeScript
 * can't know what's at it, and the result is typed as though `value` has
 * the type of what it replaces. If it doesn't, cast the result. With the
 * empty pointer, the result is `value`, and has its type.
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
export const pointerSet: {
  <V extends ReadonlyJson>(pointer: "", subject: ReadonlyJson, value: V): V;
  <T extends ReadonlyJson>(pointer: Pointer, subject: T, value: ReadonlyJson): T;
  (pointer: ""): <V extends ReadonlyJson>(subject: ReadonlyJson, value: V) => V;
  (pointer: Pointer): PointerSetter;
};
export type PointerSetter = <T extends ReadonlyJson>(subject: T, value: ReadonlyJson) => T;

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
export const pointerAssign: {
  (pointer: Pointer, subject: Json, value: Json): void;
  (pointer: Pointer): PointerAssigner;
};
export type PointerAssigner = (subject: Json, value: Json) => void;

/**
 * Returns a copy of `subject` without the value at the pointer. `subject`
 * isn't changed. Only the objects and arrays on the way to the value are
 * copied, and everything else is shared with `subject`.
 *
 * The result has `subject`'s type, though a property it requires may be
 * gone. With the empty pointer, the result is `undefined`.
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
export const pointerUnset: {
  (pointer: "", subject: ReadonlyJson): undefined;
  <T extends ReadonlyJson>(pointer: Pointer, subject: T): T;
  (pointer: ""): (subject: ReadonlyJson) => undefined;
  (pointer: Pointer): PointerUnsetter;
};
export type PointerUnsetter = <T extends ReadonlyJson>(subject: T) => T;

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
export const pointerRemove: {
  (pointer: Pointer, subject: Json): void;
  (pointer: Pointer): PointerRemover;
};
export type PointerRemover = (subject: Json) => void;

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
