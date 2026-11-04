# Package, entry points and files

Where Angular code lives, how files are named, and what `index.ts` exports. Entry-point rules (root by default, subpaths only where listed) are in [packages-and-entry-points](../workspace/packages-and-entry-points.md). Why: [entry points](../../why/entry-points.md).

## What exists

| Path | Package | Notes |
|---|---|---|
| `packages/angular` | `@cocokits/angular` | Built with `ng-packagr` (the `package` target; `build` runs it, then `scripts/strip-root-export.mjs`). It has **no root entry** (`exports` starts empty, and the script removes the `"."` export ng-packagr always generates). `tests/exports.test.ts` asserts this. Components are secondary entry points, one per component. |
| `packages/angular/core` | `@cocokits/angular-core` | Root-only package: the Angular adapter runtime (for example the id generator, the form-control bridge, the overlay portal and the theme runtime) lives here as it is written. |
| `packages/themes/<name>/angular` | `@cocokits/theme-<name>-angular` | The thin typed theme layer for one theme, written by hand ([theming](./theming.md)). |

Both Angular packages declare their `@cocokits/*` workspace dependencies in `package.json` and `@angular/core` as a peer. Framework-free imports: `@cocokits/utils` (stateless helpers), `@cocokits/shared` (contracts), `@cocokits/cdk/<module>` (behaviour building blocks), `@cocokits/machines/<name>`. There is no `@cocokits/core`.

Anatomy, meta and behaviour come from the machine ([machines](../framework-agnostic/machines.md)).

## Creating an entry point

Always with the library generator ([generators](../workspace/generators.md), [README](../../../tools/workspace-plugin/README.md)); never by hand (`--kind=fw-entry --framework=angular`; `--kind=angular-testing` only after the entry exists).


For an entry point the generator creates the folder `packages/angular/<name>/` with `index.ts`, an `ng-package.json` (`{ "lib": { "entryFile": "index.ts" } }`) and a test file under `tests/`, adds the `exports` key to the package, the tsconfig path and the size-limit entry, and removes the package placeholder. The generated files are then ordinary source: add your files next to `index.ts`. `angular-testing` creates `packages/angular/<name>/testing`, a separate entry point so that harnesses (which depend on `@angular/cdk/testing`) stay out of the runtime entry. Check the generator's README for the exact options.

## File naming

- kebab-case named after the class, no type suffix: `tab-label.ts` → `CckTabLabel`. The `cck` prefix is in the class, not the file.
- One concept per file; a private helper directive may share the file of the part it serves. Do not create `utils.ts`, `helpers.ts` or `common.ts`; suffixes such as `-tokens`, `-config`, `-types`, `-harness` are fine when they describe the content.
- Tests live in the entry's `tests/` folder next to `index.ts`, as the generator sets it up, and run with the package's `test` target.

## Naming

What a name says about its value: [architecture §10](../../architecture.md#10-simplicity-and-reuse). Classes `Cck` + PascalCase; selectors are camelCase `cck` attributes, with the element only for a part whose role has a native element; tokens `CCK_EXAMPLE`; injectors `injectCckExample`; providers `provideCckExampleConfig`; CSS classes come from the anatomy (`exampleAnatomy.classes.trigger` = `cck-example__trigger`); handlers are named for what they do (`toggle`, `select`), not for the event.

## Public API (`index.ts`)

- List exports explicitly; no `export *` from a file with private symbols.
- Export every public part, an `imports` tuple of the base parts (never a theme directive), types, the config token and provider, and `injectCckX()` only when users may author parts.
- Do not export registration methods; mark them `/** @internal */`.
- A component imports a sibling entry through its alias (`@cocokits/angular/form-field`), as [architecture §2](../../architecture.md#2-layers-and-packages) says. `tsconfig.lib.json` maps `@cocokits/angular/*` to the entry folders so the lib typecheck resolves it; ng-packagr resolves it as an entry point.

```ts
// Example (illustrative)
export { CckExample } from './example';
export { CckExampleItem } from './example-item';
export type { CckExampleOrientation } from './example-types';

/** Everything needed to author the example component: `imports: [CckExampleImports]`. */
export const CckExampleImports = [CckExample, CckExampleItem] as const;
```

`Cck<Name>Imports` replaces NgModules. The theme directive is imported separately from `@cocokits/theme-<name>-angular`.
