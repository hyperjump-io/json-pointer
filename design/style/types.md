# Types

- The API is declared in hand-written `.d.ts` files next to the JS, and
  they're the source of truth for it. They have JSDoc explaining the
  details, which editors show.
- The JS is typed with JSDoc. Type-checking (`npm run type-check`) includes
  the declaration files.
- Type tests are in `.test-d.ts` files next to the declarations.
