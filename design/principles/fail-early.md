# Fail where the mistake is

An invalid pointer throws where it's written, not later where it's used.

- The curried form parses and validates the pointer when it's given, so
  `const setName = set("name")` throws there, not when `setName` is called
  (see [Currying](../components/currying.md)).
