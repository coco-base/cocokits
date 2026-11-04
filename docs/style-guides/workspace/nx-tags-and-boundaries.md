# Nx tags and boundaries

The tags every project carries and the dependency table of the workspace. Other guides link here instead of repeating it. The table is implemented in `tools/eslint/boundaries.mjs` (`@nx/enforce-module-boundaries`); when the two differ, fix the table or the config in the same change. Commands: [targets.md](./targets.md).

## Tags

Every project has one `layer:*`, one `scope:*` (`shared` or a framework name) and one `type:*` tag (`lib` for every package; `tool` for a private tool project: the `workspace` project, `tools/workspace-plugin`, the docs tooling the `tool` kind creates, `docs-stories` and `docs-shared`, which carry `layer:docs`; `app` for the docs site and the preview apps, which carry `layer:app`; `e2e` for the browser tests of the built docs site, `docs-e2e`, which carries `layer:app` too; the config also defines `test` constraints). The `library` generator writes them. Why `layer:docs`: [layers](../../why/layers.md#docs-tooling-has-its-own-layer). Why `layer:app`: [layers](../../why/layers.md#apps-have-their-own-layer). Why `type:e2e`: [layers](../../why/layers.md#e2e-projects-import-nothing).

## Dependency table

"May depend on" lists the only workspace projects a project may import at runtime.

| Tags | Projects | May depend on | Never |
|---|---|---|---|
| `layer:utils`, `scope:shared` | `utils` | nothing internal | |
| `layer:shared`, `scope:shared` | `shared` | nothing internal | |
| `layer:cdk`, `scope:shared` | `cdk` | `utils`, `shared`; sibling cdk modules (no cycle) | a machine, a framework package |
| `layer:machine`, `scope:shared` | `machines` | `utils`, `shared`, `cdk`; other machines' entries (no cycle) | a framework package |
| `layer:fw-core`, `scope:<fw>` | `<fw>-core` | `utils`, `shared`, `cdk`; its framework | any machine (`@cocokits/machines/*`) |
| `layer:fw-component`, `scope:<fw>` | `<fw>` (`@cocokits/<fw>/<component>`) | `utils`, `shared`, `cdk`, `machines`, `<fw>-core` of the same scope | another framework's packages, a theme |
| `layer:theme`, `scope:shared` | `theme-<name>` (framework-free) | `shared` | cdk, machines, any framework package |
| `layer:theme`, `scope:<fw>` | `theme-<name>-<fw>` | `theme-<name>` (its core), `<fw>-core`, `<fw>` components of the same scope, `shared` | machines, cdk, another framework |
| `type:tool` | `workspace` | nothing internal | |
| `layer:docs`, `scope:shared`, `type:tool` | `story-compiler` (`tools/story-compiler`), `consumer-fixture` (`tools/consumer-fixture`), `docs-stories` (`packages/docs-stories`), `docs-shared` (`packages/docs-shared`) | `shared`, other `layer:docs` projects | any other workspace project; the config checks the `type:tool` tag, which allows `layer:shared` and `layer:docs` only |
| `layer:app`, `scope:shared`, `type:app` | `docs` (`apps/docs`) | `shared`, `docs-stories`, `docs-shared`, `machines`, `theme-<name>` (framework-free) | a framework package, a framework theme layer |
| `layer:app`, `scope:shared`, `type:e2e` | `docs-e2e` (`apps/docs-e2e`) | nothing internal; it tests the built site and imports no repo source | any workspace project |
| `layer:app`, `scope:<fw>`, `type:app` | `preview-<fw>` (`apps/preview-<fw>`) | `<fw>`, `<fw>-core`, `theme-<name>` and `theme-<name>-<fw>` of the same scope, `shared`, `docs-stories`, `docs-shared` | machines directly, another framework |

Scope rules: `scope:shared` projects never depend on a framework project; a framework project depends on itself and `scope:shared`.

The config also encodes constraints for `type:test` projects and test-file allowances (for example `@cocokits/cdk/testing`). `layer:app` has no constraint of its own: no layer lists it as a dependency, so no package imports an app, and the `type:app` and `scope:*` rules govern what an app imports.

## Test files

Test files (`tests/**`, `*.test.*`, `*.spec.ts`, `*.ssr.test.*`, `*.conformance.ts`) get a second ESLint block with additional allowances (`layer:cdk` for every lib, test runners and Testing Library packages as external imports); production files never get them.

## Rules

- A `scope:shared` project never contains framework-specific code. Framework code lives in a `scope:<fw>` project, which is why theme layers are separate packages.
- `packages/machines/<name>/` is one subpath of one project, not a project, and the same holds for a cdk module and a framework component subpath. The tag rules cannot tell them apart, so the `cycles` target adds two rules (below). "No root entry" for machines stays a review rule.
- **No cycle** between siblings, and the import forms: [architecture §2](../../architecture.md#2-layers-and-packages) owns the rule. Test files in a component folder are in scope.
- The `cycles` target (dependency-cruiser, config `.dependency-cruiser.cjs`) enforces the rule: `no-circular` counts every dependency, `import type` included, and `no-relative-cross-component` rejects an import into another component folder other than its `index`. `lint` depends on `cycles`. A folder named `internal/` holds package helpers, not a component, so importing it is allowed; a helper must not import a component. Nx's project-level circular check stays as it is.
- External imports of `scope:shared` layers are limited by `allowedExternalImports` in `tools/eslint/boundaries.mjs`. Ask a maintainer before extending the list.
