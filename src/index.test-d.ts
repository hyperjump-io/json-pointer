import { InvalidPointerError, NotAContainerError, pointerAssign, pointerGet, pointerRemove, pointerSet, pointerUnset } from "./index.js";
import type { Json, PointerGetter, PointerSetter, ReadonlyJson } from "./index.d.ts";

declare const doc: Json;
const constDoc = { name: "Ada", languages: ["English", "French"] } as const;

// A pointer can be a string or its segments, including readonly ones
pointerGet("/foo/0", doc);
pointerGet(["foo", "0"], doc);
pointerGet(["foo", "0"] as const, doc);

// What's found in a mutable value is mutable
pointerGet("/name", doc) satisfies Json | undefined;
pointerSet("/name", doc, "Grace") satisfies Json;
pointerUnset("/name", doc) satisfies Json;

// set and unset return the subject's type, so what's in it can be read
const person = { name: "Ada", address: { city: "London" } };
pointerSet("/address/city", person, "Paris").address.city satisfies string;
pointerUnset("/name", person).address.city satisfies string;
pointerSet("/name", pointerSet("/address/city", person, "Paris"), "Grace") satisfies typeof person;

// With the empty pointer, set returns the value and unset returns undefined
pointerSet("", person, 42) satisfies number;
pointerUnset("", person) satisfies undefined;
pointerSet("")(person, 42) satisfies number;
pointerUnset("")(person) satisfies undefined;

// What's only read can be readonly, and what's found in it stays readonly
pointerGet("/languages", constDoc) satisfies ReadonlyJson | undefined;
// @ts-expect-error
pointerGet("/languages", constDoc) satisfies Json | undefined;
pointerSet("/name", constDoc, "Grace") satisfies typeof constDoc;
pointerUnset("/name", constDoc) satisfies typeof constDoc;
// @ts-expect-error
pointerSet("/name", constDoc, "Grace") satisfies Json;

// What changes its subject in place can't take a readonly one
// @ts-expect-error
pointerAssign("/name", constDoc, "Grace");
// @ts-expect-error
pointerRemove("/name", constDoc);

// Given only a pointer, the functions are curried
const getName: PointerGetter = pointerGet("/name");
const people: Json[] = [{ name: "Ada" }, { name: "Grace" }];
people.map(getName) satisfies (Json | undefined)[];
getName(constDoc) satisfies ReadonlyJson | undefined;

const setName: PointerSetter = pointerSet("/name");
setName(doc, "Ada") satisfies Json;
setName(person, "Grace") satisfies typeof person;

// A missing subject isn't a curried call
// @ts-expect-error
pointerGet("/name", undefined);

// set needs a value
// @ts-expect-error
pointerSet("/name", doc);

// Errors can be told apart by class, but only this package throws them
try {
  pointerGet("/name", doc);
} catch (error) {
  if (error instanceof NotAContainerError) {
    error.location satisfies string;
  }
}
// @ts-expect-error
new InvalidPointerError();
