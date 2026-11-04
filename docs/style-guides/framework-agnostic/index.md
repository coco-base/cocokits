# Framework-agnostic style guide

Rules for code in `@cocokits/utils`, `@cocokits/shared`, `@cocokits/cdk/<module>` and `@cocokits/machines/<name>`: the layers every framework package builds on. Nothing here imports a framework. The cross-cutting rules are in [docs/architecture.md](../../architecture.md); the reasons are in [docs/why](../../why/index.md). These files add only what is specific to these four packages.

## Load on demand

| File | Load when |
|---|---|
| [layers-and-imports.md](./layers-and-imports.md) | Deciding which package code belongs in; imports and entry points |
| [typescript-rules.md](./typescript-rules.md) | Types, naming, errors, TSDoc |
| [utils.md](./utils.md) | Adding or changing a function in `@cocokits/utils` |
| [shared.md](./shared.md) | Adding a contract type or pure helper to `@cocokits/shared` |
| [machines.md](./machines.md) | Files, exports, `connect()`, state, events and keyboard data of a machine |
| [cdk-modules.md](./cdk-modules.md) | Authoring a `@cocokits/cdk/<module>` |
| [ssr-and-lifecycle.md](./ssr-and-lifecycle.md) | DOM access, SSR safety, cleanups, per-document state |
| [overlays-and-positioning.md](./overlays-and-positioning.md) | Dialog, popover, tooltip, menu, select content, toast |

## Tests

Unit tests of these packages: [unit-tests](../testing/unit-tests.md). A test that needs a rendered component is a component test in each framework package ([testing guide](../testing/index.md)).
