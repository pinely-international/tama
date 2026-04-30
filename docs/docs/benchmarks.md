# Benchmarks

Benchmarks for Tama live in two places in this repository:

- `benchmarks/` for focused benchmark scenarios
- `comparison/` for side-by-side implementation sketches

## How To Read Them

Use these benchmarks directionally.
They are useful for understanding Tama's runtime model, especially:

- initial DOM inflation
- view replacement behavior
- serializer output paths
- app patterns built around observables instead of rerender loops

They are not a complete industry-wide benchmark suite, and they should not be treated as one.

## What They Do Not Prove

Benchmarks in this repository do not fully measure:

- application architecture quality
- long-term maintainability
- routing complexity
- testing ergonomics
- every competing library or every optimization strategy

In particular, the files inside `comparison/` are illustrative rather than exhaustive.

## Practical Advice

If you are evaluating Tama for real apps, read the benchmarks together with:

- [Building Apps](./learn/how-to-use/building-apps.md)
- [List Rendering](./learn/guides/list-rendering.md)
- [SSR](./learn/how-to-use/ssr.md)
- [App Readiness Audit](./app-readiness-audit.md)

That combination gives a better picture than benchmark numbers alone.
