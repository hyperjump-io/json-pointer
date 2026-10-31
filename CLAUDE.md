# @hyperjump/json-pointer v2

A from-scratch rewrite of `@hyperjump/json-pointer` v1 (`../json-pointer`).

## Docs

- `design/` is for contributors. Start with `design/README.md`, the index,
  and read only the documents about what you're working on. `principles/`
  are the rules decisions are made by, `style/` is how code is laid out,
  and `components/` say how each part works and what was decided, with its
  open questions and known limitations.
- `website/` is the user documentation. It's built into the site at
  hyperjump.io from `../hyperjump.io`, where `design/style/` says how to
  write the prose and the README says how pages are put together. A
  feature that isn't released gets `*Coming soon*` on its own line under
  its heading. `npm version` replaces it with `*Added in vX.Y.Z*`
  (`scripts/version-docs.js`).
- `TODO.md` is the plan and what's next. It isn't committed.
- Prefer many small documents that each cover one thing. A change to how
  something works updates its document in the same commit. A decision
  that's made goes in its component's document, with what was rejected
  and why.

## Development

- `npm test`, `npm run lint`, `npm run type-check`
- The API is declared in hand-written `.d.ts` files next to the JS, which is
  typed with JSDoc. Type-checking includes the declaration files.

## Working agreements

- Ask before committing. Keep unrelated changes in separate commits.
