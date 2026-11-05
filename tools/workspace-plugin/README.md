# @cocokits/workspace

Workspace generators and executors of CocoKits (private, `type:tool`). The generator `library` scaffolds packages and entry points. The executor `tokens` is described at the end.

```bash
pnpm nx g @cocokits/workspace:library <name> --kind=<kind> [--framework=<fw>] [--theme=<theme>] [--skipFormat]
```

Templates are EJS files under `src/generators/library/files/`. The generator is idempotent: existing projects and entry folders are left untouched, and `exports`, tsconfig paths and size-limit entries are only added when missing. It formats the generated files unless `--skipFormat` is passed.

## Options

| Option       | Meaning                                                                                                                                                                                                                                                                |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`       | What to create (required). See the tables below                                                                                                                                                                                                                        |
| `name`       | First positional argument. Lowercase letters, digits and `-`, starting with a letter. Names an entry point, the tool for `tool` (required), or `utils`/`shared` for `shared-lib`. Optional for package kinds with a fixed project name (a different value is rejected) |
| `framework`  | `angular`, `react` or `vue`                                                                                                                                                                                                                                            |
| `theme`      | Theme name for `theme-core` and `theme-fw`                                                                                                                                                                                                                             |
| `skipFormat` | Skip formatting the generated files                                                                                                                                                                                                                                    |

Options a kind does not take are rejected. Reserved folder names (such as `index`, `src`, `dist`, `tests`, `scripts`, and `core`/`testing` for machines and framework entries) cannot name an entry point.

## Package kinds

| Kind         | Creates                                                                                                                                                         | Required options             |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `shared-lib` | `@cocokits/utils` or `@cocokits/shared`                                                                                                                         | `name` (`utils` or `shared`) |
| `cdk`        | `@cocokits/cdk`, one subpath per module, no root entry                                                                                                          | none                         |
| `machines`   | `@cocokits/machines`, one subpath per component, no root entry                                                                                                  | none                         |
| `fw-core`    | `@cocokits/<fw>-core` in `packages/<fw>/core`                                                                                                                   | `framework`                  |
| `fw`         | `@cocokits/<fw>`, one subpath per component                                                                                                                     | `framework`                  |
| `theme-core` | Framework-free `@cocokits/theme-<theme>` in `packages/themes/<theme>/core`, with a `docs-data` target                                                           | `theme`                      |
| `theme-fw`   | Theme layer `@cocokits/theme-<theme>-<fw>` in `packages/themes/<theme>/<fw>`                                                                                    | `theme`, `framework`         |
| `tool`       | Private tooling `@cocokits/<name>` in `tools/<name>` (tags `layer:tool`, `scope:shared`, `type:tool`), no `exports`, no build, root devDependency `workspace:*` | `name`                       |

A package gets `project.json` (with layer/scope/type tags and the `pack`, `publint` and `attw` targets), `package.json` with `exports`, version `2.0.0`, the license and the repository, build, test and lint configuration, a README, a placeholder source file and registration in tsconfig paths, size-limit and the changeset group. Framework packages read the peer ranges from `compatibility.json`. The builder follows the framework: `tsdown` by default, `ng-packagr` for Angular, Vite for Vue.

A `tool` is the exception: it is private and runs from source, so it gets `project.json` (no `build` target), a `package.json` without `exports`, strict tsconfigs that emit nothing, test and lint configuration, a README and a placeholder source and test, and registers nothing for publishing (no tsconfig path, size-limit entry or changeset group). It declares `@cocokits/shared` when that package exists and adds itself to the root `devDependencies` as `workspace:*`, so Nx finds the executors it declares. Run `pnpm install` after generating one.

A tool name must be its own. The generator rejects the names of the folders of `tools/` and of the existing packages and projects (`eslint`, `scripts`, `workspace`, `utils`, `shared`, `angular` and the like), and any name that another project under `packages` or `tools` has as its project name or as its package name `@cocokits/<name>`. It checks before it writes anything, and a rerun for the same `tools/<name>` passes, so the generator stays idempotent.

## Entry-point kinds

An entry point is added to an existing package. It creates `index.ts` and a test, adds the `exports` key, the tsconfig path and the size-limit entry, and removes the package placeholder. The parent package must exist.

| Kind              | Creates                                                                                                                                                                                               | Required options                         |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `cdk-module`      | `@cocokits/cdk/<name>`                                                                                                                                                                                | `name`                                   |
| `machine`         | `@cocokits/machines/<name>`                                                                                                                                                                           | `name`                                   |
| `fw-entry`        | `@cocokits/<fw>/<name>`                                                                                                                                                                               | `name`, `framework`                      |
| `angular-testing` | `@cocokits/angular/<name>/testing`; the `<name>` entry point must exist first; adds `@angular/cdk` as an optional peer of `@cocokits/angular` (the `@angular/core` range) and as a root devDependency | `name` (`framework` is always `angular`) |

## Examples

```bash
# a package (once)
pnpm nx g @cocokits/workspace:library --kind=cdk
pnpm nx g @cocokits/workspace:library --kind=fw --framework=react

# entry points (example names)
pnpm nx g @cocokits/workspace:library focus-trap --kind=cdk-module
pnpm nx g @cocokits/workspace:library example --kind=machine
pnpm nx g @cocokits/workspace:library example --kind=fw-entry --framework=vue

# a private tool
pnpm nx g @cocokits/workspace:library my-tool --kind=tool

# a theme: framework-free package, then one layer per framework
pnpm nx g @cocokits/workspace:library --kind=theme-core --theme=acme
pnpm nx g @cocokits/workspace:library --kind=theme-fw --theme=acme --framework=angular
```

## Executor `tokens`

`@cocokits/workspace:tokens` turns a token JSON file into CSS or SCSS. A theme runs it as its `tokens` target. A collection field outside the token format fails it and is named. Every path option is workspace-relative and goes through `insideRoot` (`src/executors/inside-root.ts`), which also resolves symlinks and junctions.

| Option        | Meaning                                                                                                                                                                                                                                                                                 |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `input`       | Token JSON path, or several paths merged, relative to the workspace root (required)                                                                                                                                                                                                     |
| `output`      | Output file path, relative to the workspace root (required)                                                                                                                                                                                                                             |
| `modesOutput` | Optional TypeScript file with the mode list, union type and default mode of every collection that has more than one mode, and the modes index `modeCollections`: one entry per collection that has a mode attribute, with the attribute and the values its selectors use (theme-config) |
| `format`      | `css` (default), or `scss`: a `$` alias per token and a `tokens` mixin of CSS                                                                                                                                                                                                           |

## Executor `docs-data`

`@cocokits/workspace:docs-data` writes the docs data of a project as JSON into `dist/docs-data/<project>/` at the workspace root (option `outputDir`; `{projectName}`, `{projectRoot}` and `{workspaceRoot}` are expanded), from the project's built package, so the target depends on `build` (nx.json). It replaces the JSON files of the folder, so a removed component leaves nothing stale.

| `source`   | Reads                                                                                                | Writes                                           |
| ---------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `machines` | Every `./<name>` subpath of the package `exports`; each must export `<name>Anatomy` and `<name>Meta` | `<name>.json` per component (`ComponentDocData`) |
| `theme`    | The single `ThemeConfig` and the `modeCollections` the built entry exports                           | `theme.json` (`ThemeDocData`)                    |

The target fails, naming the subpath or the export, on a subpath without the two exports, on a theme option with an unknown field or a default that is not a value, and on a `modeCollections` export that is missing or malformed (an unknown field, an `attrName` outside `^[a-z0-9-]+$`, no modes, a `defaultMode` that is not a mode name, or an `attrName` twice in one scope: the page, or one component). It copies `modeCollections` unchanged. The theme decides how its modes index is produced (cocokits: the `tokens` option `modesOutput`).

## Executor `api-docs-angular`

`@cocokits/workspace:api-docs-angular` writes `<component>.json` (`ApiDoc`) for every Angular entry point of a package (a folder with `ng-package.json` and `index.ts`, except `core`) into `dist/api-docs/<project>/` at the workspace root (option `outputDir`), from the TSDoc. It builds an `NgtscProgram` from the package `tsconfig` (option `tsConfig`) and reads `getApiDocumentation`; the members of the classes a directive extends come from the type checker, through any base class. Input types are read types (`booleanAttribute` gives `boolean`). The target fails, writing nothing, on a public member without TSDoc (inherited ones included), on a directive without `@cckPart`, and on a malformed `@cckSlot` tag or a default slot with a selector.

## Executor `api-docs-react`

`@cocokits/workspace:api-docs-react` writes `<component>.json` (`ApiDoc`) for every React entry point of a package (`src/<name>/index.ts`) into `dist/api-docs/<project>/` at the workspace root (option `outputDir`), from the TypeScript checker and the TSDoc (option `tsConfig`). It lists the props of each exported component that a CocoKits file declares; native button props, `ref` and DOM types are not listed. The target fails, writing nothing, on a part without `@cckPart` or a description and on a listed prop without TSDoc.

## Executor `api-docs-vue`

`@cocokits/workspace:api-docs-vue` writes `<component>.json` (`ApiDoc`) for every Vue entry point of a package (`src/<name>/index.ts`) into `dist/api-docs/<project>/` at the workspace root (option `outputDir`), from the `.vue` components of each entry point, read with `vue-component-meta` (props, emits, slots, exposed methods) from the package `tsconfig` (option `tsConfig`). The target fails, writing nothing, on an entry point without a `.vue` component and on a member without a TSDoc description.

## Executor `api-parity`

`@cocokits/workspace:api-parity` compares the Angular, React and Vue `ApiDoc` files by semantic id. It reads `dist/api-docs/angular`, `dist/api-docs/react` and `dist/api-docs/vue` (option `apiDocsDirs`), so the three `api-docs` targets run first; the `api-parity` target of this project depends on them.
