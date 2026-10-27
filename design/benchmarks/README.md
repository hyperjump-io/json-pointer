# Benchmarks

Measurements behind the performance decisions in
[the design docs](../README.md), one experiment per file, with the date it
was first recorded.

The benchmark code is in `benchmark/`, which isn't committed. It compares
`src/` here, uncommitted changes included, with v1 in the checkout next to
this repo (`../json-pointer`). Run it with
`npx vitest bench --run --root benchmark --reporter=./benchmark/reporter.js`,
and don't run anything else while it runs.

- [Comparison with v1](v1-comparison.md) (2026-10-26)
