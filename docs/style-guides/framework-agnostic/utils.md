# Utils (`@cocokits/utils`)

A util is a pure, synchronous, dependency-free function used by at least two packages: no state, no timers, no framework. The package has one root entry.

## Is it a util?

| The helper... | It is |
|---|---|
| stateless, generic, needed by two or more packages | a util |
| a stateless DOM query or SSR guard that takes its node, event or document as an argument | a util |
| pure but used by one package only | a private helper in that package |
| holds state, listeners, observers or timers | a [cdk module](./cdk-modules.md) |
| defines a CocoKits contract | [shared](./shared.md) |
| moves DOM nodes or computes overlay coordinates | the framework portal or the cdk [overlay modules](./overlays-and-positioning.md) |

## Rules

- Pure and synchronous: no `Date.now()`, `Math.random()`, I/O or module-level cache. No workspace or npm dependencies.
- DOM helpers take the node, event or document as an argument.
- One exported function per file, named after the file. Use an options object instead of boolean positional flags.
- Defined behaviour for every input: handle empty input, out-of-range numbers and `NaN` explicitly, document it, and return a sentinel (`-1`, `null`). Loops have an explicit bound. Exception: helpers whose documented job is to throw on programmer errors.
- Accept `readonly` inputs and never mutate arguments.
- Tests are table-driven (`it.each` over object rows) and cover every branch.

## Ids

Id rules: [machines](./machines.md#ids). `toIdSegment` is the injective encoder.

## Merging props

Merging consumer props with ours composes handlers (the consumer's first, so it can veto through `event.defaultPrevented`), concatenates `class` and merges `style`.
