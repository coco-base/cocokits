# Packages and entry points

How a package is named, which entry points it exposes and how its `package.json` and build are set up. Dependencies between packages: [nx-tags-and-boundaries.md](./nx-tags-and-boundaries.md). Package and entry-point names below are patterns; component names are examples.

## Names

| Kind | Pattern | Example |
|---|---|---|
| Shared libraries | `@cocokits/<name>` | `@cocokits/utils`, `@cocokits/shared`, `@cocokits/cdk` |
| CDK module | `@cocokits/cdk/<module>` | `@cocokits/cdk/positioning` |
| Machine | `@cocokits/machines/<component>` (no root) | `@cocokits/machines/switch` |
| Framework core | `@cocokits/<fw>-core` | `@cocokits/angular-core`, `@cocokits/vue-core` |
| Framework components | `@cocokits/<fw>/<component>` | `@cocokits/react/switch` |
| Angular component harness | `@cocokits/angular/<component>/testing` | `@cocokits/angular/switch/testing` |
| Theme, framework-free | `@cocokits/theme-<name>` | `@cocokits/theme-cocokits` |
| Theme, framework layer | `@cocokits/theme-<name>-<fw>` | `@cocokits/theme-cocokits-angular` |
| Internal | `@cocokits/<name>` + `"private": true` | `@cocokits/workspace` |

## Entry points

| Package | Entry points | Reason |
|---|---|---|
| `@cocokits/utils`, `@cocokits/shared`, `@cocokits/<fw>-core`, `@cocokits/theme-<name>`, `@cocokits/theme-<name>-<fw>`, private packages | Root only | Subpaths would add import paths with no measurable benefit |
| `@cocokits/cdk` (for example `form-control`) | One subpath per module | Modules are independent; some need optional peer dependencies that a barrel would force on everyone; dev servers and test runners evaluate a whole barrel |
| `@cocokits/machines` | One subpath per component, no root | Same as cdk |
| `@cocokits/<fw>` | One subpath per component | Angular builds each component as its own entry point; React keeps one `'use client'` boundary per component; dev servers and test runners evaluate a full barrel |
| `@cocokits/angular` | Additionally one `/<component>/testing` subpath per component, and `/form-control`, the one subpath without a component | The harness depends on `@angular/cdk/testing` and never ships in the runtime entry. `/form-control` is the abstract base that the form controls share (`CckFormControlBase`, not for direct use): it needs the optional `@angular/forms` peer, so it cannot live in `angular-core` or `form-field`, and ng-packagr entries cannot share a relative file |

Why: [entry points](../../why/entry-points.md).

- A new subpath needs a row in this table with its reason, and its reasoning in [why/entry-points.md](../../why/entry-points.md). The entry-point lint rule (`tools/eslint/entry-points.mjs`) rejects other subpath imports.
- Do not add `/meta`, `/dom`, `/theme` or similar sub-subpaths. The anatomy and meta are exported from `@cocokits/machines/<name>` together with the machine.
- **Asset exports** are files, not code entry points: `@cocokits/theme-<name>/styles.css`, `@cocokits/theme-<name>/components/<component>.css`, `@cocokits/theme-<name>/tokens.css` where the theme has tokens. A theme also exports its logo files `@cocokits/theme-<name>/logo-light.svg` and `logo-dark.svg`. The stylesheets are the only `sideEffects` entries of the package.

## package.json rules

- ESM only: `"type": "module"`, `exports` with `types` + `default` per entry, `files: ["dist"]`. Exception: the ng-packagr packages (`angular-core`, `angular`, `theme-<name>-angular`) publish from their dist directory through `publishConfig.directory`, have no `files` field, and keep `exports: {}` in the source `package.json` because ng-packagr writes the exports (the `@cocokits/angular` build also strips the root export).
- Every published package has the same `version` (Changesets keeps them in one `fixed` group), `"license": "Apache-2.0"` and a `repository` with the `directory` of the package. The generator writes them.
- `sideEffects: false`; theme core packages set `sideEffects: ["*.css"]`.
- Internal dependencies are `workspace:*`; Changesets rewrites them on publish. A package never bundles another workspace package.
- Framework peers use the ranges of `compatibility.json`, written as `>=` / `^`, never an exact pin; they live only in `peerDependencies`. `compatibility.json` is the only file besides `package.json` that names supported versions. Raising `low` is a major change; raising `high` is a minor change with a changeset.
- Optional peers of `@cocokits/cdk` (`peerDependenciesMeta.optional: true`), each imported by exactly one module: `@floating-ui/dom` (`cdk/positioning`), `@internationalized/date` and `@internationalized/number`.
- `@angular/forms` is an optional peer of `@cocokits/angular` (`peerDependenciesMeta.optional: true`, the range of `@angular/core`), imported only by the entries that implement a Signal Forms control (`form-control`, `input`, `textarea`, `checkbox`, `switch`); `input` and `checkbox` import the shared `CckFormControlBase` from `@cocokits/angular/form-control`. `switch` imports the shared `CckCheckControlBase` from `@cocokits/angular/checkbox`, as `textarea` does from `input`; `radio` imports nothing from `@angular/forms`. An application that uses none of them needs no forms package.
- A theme framework package has peers: its theme core, `@cocokits/<fw>-core`, `@cocokits/<fw>` and the framework. It never lists another framework.

```jsonc
// packages/themes/cocokits/core/package.json (excerpt)
{
  "name": "@cocokits/theme-cocokits",
  "type": "module",
  "sideEffects": ["*.css"],
  "files": ["dist"],
  "exports": {
    ".":                  { "types": "./dist/index.d.ts", "default": "./dist/index.js" },
    "./styles.css":       "./dist/styles.css",
    "./tokens.css":       "./dist/tokens.css",
    "./components/*.css": "./dist/components/*.css"
  },
  "peerDependencies": { "@cocokits/shared": "workspace:*" }
}
```

## Builders

| Package | Builder |
|---|---|
| `utils`, `shared`, `cdk`, `machines`, `react-core`, `react`, `theme-<name>` (core), `theme-<name>-react` | `tsdown` (ESM); the theme core also builds its CSS with `sass` |
| `angular-core`, `angular`, `theme-<name>-angular` | `ng-packagr` via `@nx/angular:package`; published from `dist/packages/…` |
| `vue-core`, `vue`, `theme-<name>-vue` | Vite library mode and `vue-tsc` declarations |

## TypeScript setup

- `tsconfig.base.json` uses `moduleResolution: "bundler"` and relative `paths`; no `baseUrl`.
- Shared strict flags live in `tsconfig.strict.json`.
