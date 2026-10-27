import * as JsonPointer from "./index.js";
import type { Getter, Json, ReadonlyJson, Setter } from "./index.d.ts";

declare const doc: Json;
const constDoc = { name: "Ada", languages: ["English", "French"] } as const;

// A pointer can be a string or its segments, including readonly ones
JsonPointer.get("/foo/0", doc);
JsonPointer.get(["foo", "0"], doc);
JsonPointer.get(["foo", "0"] as const, doc);

// What's found in a mutable value is mutable
JsonPointer.get("/name", doc) satisfies Json | undefined;
JsonPointer.set("/name", doc, "Grace") satisfies Json;
JsonPointer.unset("/name", doc) satisfies Json | undefined;

// What's only read can be readonly, and what's found in it stays readonly
JsonPointer.get("/languages", constDoc) satisfies ReadonlyJson | undefined;
// @ts-expect-error
JsonPointer.get("/languages", constDoc) satisfies Json | undefined;
// @ts-expect-error
JsonPointer.set("/name", constDoc, "Grace") satisfies Json;
// @ts-expect-error
JsonPointer.set("/name", doc, ["Grace"] as const) satisfies Json;
// @ts-expect-error
JsonPointer.unset("/name", constDoc) satisfies Json | undefined;

// What changes its subject in place can't take a readonly one
// @ts-expect-error
JsonPointer.assign("/name", constDoc, "Grace");
// @ts-expect-error
JsonPointer.remove("/name", constDoc);

// Given only a pointer, the functions are curried
const getName: Getter = JsonPointer.get("/name");
const people: Json[] = [{ name: "Ada" }, { name: "Grace" }];
people.map(getName) satisfies (Json | undefined)[];
getName(constDoc) satisfies ReadonlyJson | undefined;

const setName: Setter = JsonPointer.set("/name");
setName(doc, "Ada") satisfies Json;

// A missing subject isn't a curried call
// @ts-expect-error
JsonPointer.get("/name", undefined);

// set needs a value
// @ts-expect-error
JsonPointer.set("/name", doc);

// Errors can be told apart by class, but only this package throws them
try {
  JsonPointer.get("/name", doc);
} catch (error) {
  if (error instanceof JsonPointer.NotAContainerError) {
    error.location satisfies string;
  }
}
// @ts-expect-error
new JsonPointer.InvalidPointerError();
