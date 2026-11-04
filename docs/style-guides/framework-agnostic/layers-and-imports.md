# Layers, entry points and imports

Which package code belongs in and how packages are imported. The layers and entry points are in [docs/architecture.md](../../architecture.md); the Nx tag table and the lint configuration are in the [workspace guide](../workspace/nx-tags-and-boundaries.md), which wins if this page disagrees. Why: [layers](../../why/layers.md).

Where code goes:

| The code... | Package |
|---|---|
| is a pure, stateless, generic function | `@cocokits/utils` |
| defines a CocoKits contract or the pure helper that defines it | `@cocokits/shared` |
| holds state, listeners, observers or timers, and is reusable behaviour | `@cocokits/cdk/<module>` |
| is one component's anatomy, meta, behaviour and props per part | `@cocokits/machines/<name>` |
| is a hook, or uses a framework API | `@cocokits/<fw>-core` |

## Imports

- Import workspace packages by their public specifier. No relative paths across package roots, no deep paths (`@cocokits/cdk/src/...`).
- Siblings (cdk modules, machines, framework components) import each other's entry with no cycle, never a file inside it: [architecture §2](../../architecture.md#2-layers-and-packages), checked by [`cycles`](../workspace/nx-tags-and-boundaries.md#rules).
- Use `import type` for type-only imports.
- No circular imports, `import type` included.

## Exports

- `index.ts` files use explicit named exports. No `export *`, no `export default`. The roots of utils and shared may aggregate, because they hold only pure, top-level-free code.
