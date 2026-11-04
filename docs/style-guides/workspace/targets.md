# Nx targets and commands

The one list of the commands that exist. Guides refer to this file. A check that is not listed here does not exist; do not substitute another check.

## Project targets

| Target | Runs | Projects |
|---|---|---|
| `build` | Library build (`dependsOn: ["^build"]`). Most packages use `tsdown`, the Vue packages Vite, the Angular packages `ng-packagr` (through their `package` target). A tool project has no `build`: Nx runs its sources as they are | all packages |
| `typecheck` | `tsc --noEmit` on the lib and test configs | all packages and the tool projects |
| `lint` | Typed ESLint with `--max-warnings 0`; includes the module-boundary rule, the entry-point import rule ([nx-tags-and-boundaries.md](./nx-tags-and-boundaries.md)), the Angular contract rules (`tools/eslint/contract-rules.mjs`: no `cck-` class literal and no manual `addEventListener` or `removeEventListener` in Angular code; exceptions: [below](#lint-exceptions)), the `cycles` target and the file-size rule (no TS, TSX, JS, JSX, HTML, CSS, SCSS or Markdown file over 500 lines of code; HTML, CSS, SCSS and Markdown files are linted for that rule only) | all packages and the tool projects |
| `cycles` | `depcruise <projectRoot> --config .dependency-cruiser.cjs` (dependency-cruiser, run from the repository root): fails on an import cycle (`import type` included) and on an import into another component folder other than its entry. The rules and the component folders: [nx-tags-and-boundaries.md](./nx-tags-and-boundaries.md#rules); the config's comments name them in code. Cached on the project's files and the config; `lint` depends on it. The check itself is tested on fixtures by the `workspace:test` target (`tools/workspace-plugin/src/checks/dependency-cycles.spec.ts`) | `machines`, `cdk`, `angular`, `react`, `vue` |
| `test` | Vitest | all packages and the tool projects |
| `tokens` | Generates the theme's token stylesheet and, when the optional `modesOutput` option is set, a TypeScript file of mode lists and the modes index `modeCollections` from its token JSON (what it holds and how it is used: [theme-config](../themes/theme-config.md#values-from-token-collections)) (`@cocokits/workspace:tokens`); `input`, `output` and `modesOutput` are workspace-relative and must stay inside the workspace, also after resolving symlinks and junctions; `build`, `typecheck`, `lint` and `test` depend on it | `theme-cocokits` |

### Publish checks

| Target | Runs | Projects |
|---|---|---|
| `pack` | `pnpm pack` into `dist/tarballs/<project>` (`tools/scripts/package-checks.mjs`): the tarball npm would receive, with `workspace:*` resolved and `publishConfig.directory` followed for the ng-packagr packages; depends on `build` | every published package |
| `publint` | publint on that tarball with `--level warning --strict`; depends on `pack` | every published package |
| `attw` | Are the Types Wrong on that tarball, profile `esm-only` (the packages are ESM only, so the CommonJS and `node10` columns are not part of the contract); depends on `pack` | every published package |

`pnpm size` runs size-limit over `size-limit.config.mjs`, which lists one entry per built entry point and stylesheet; run `pnpm build` first.

### API and docs data targets

| Target | Runs | Projects |
|---|---|---|
| `docs-data` | Component or theme data as JSON into `dist/docs-data/<project>/` (`@cocokits/workspace:docs-data`); depends on `build`. A consumer such as a docs site reads it | `machines`, every theme core the generator makes |
| `api-docs` | API extraction into `dist/api-docs/<project>/`; fails on a public member without TSDoc. `angular`: the Angular compiler's docs extractor (`@cocokits/workspace:api-docs-angular`); `react`: the TypeScript checker (`@cocokits/workspace:api-docs-react`); `vue`: `vue-component-meta` (`@cocokits/workspace:api-docs-vue`). The three share `api-docs-common`; the target depends on `^build`, and its inputs add the machine `*.types.ts` files. Rules: [api-extraction.md](./api-extraction.md) | `angular`, `react`, `vue` |
| `api-parity` | Compares the Angular, React and Vue `ApiDoc` files in `dist/api-docs/{angular,react,vue}` by semantic id (`@cocokits/workspace:api-parity`); failure and report rules in the [parity policy](./api-extraction.md#pipeline); depends on the three `api-docs` targets | `workspace` |

The generated `src/generated/` folders of the themes are git-ignored and are the Nx outputs of their `tokens` target; `dist/` holds every other output.

Run one target on one project with `pnpm nx run <project>:<target>`, for example `pnpm nx run machines:test`.

## Lint exceptions

A lint exception is never a disable comment (`eslint-disable`). A file with a justified use of a banned pattern is an entry in `tools/eslint/exceptions.mjs`: its files, the rules it turns off and a one-line reason. A test file is listed the same way, with its reason. A folder ESLint must not read at all (the fixtures of the cycle check) is an `IGNORED` entry in the same file, with its reason. A part's manual listener also needs a row in the [host-bindings exceptions table](../angular/host-bindings-and-data-attrs.md#exceptions) first. Why: [tooling](../../why/tooling.md#lint-exceptions-live-in-one-file).

## Workspace commands

| Command | Runs |
|---|---|
| `pnpm nx format:check` / `pnpm nx format` | Prettier over the workspace (also `pnpm format:check`, `pnpm format`) |
| `pnpm nx affected -t lint typecheck test build` | The local set (also `pnpm affected`) |
| `pnpm ci:local [--base <ref>] [--title "<PR title>"] [--all]` | The whole GitHub pipeline locally; run before every PR push: [ci-pipeline.md](./ci-pipeline.md#pnpm-cilocal) |
| `pnpm nx run-many -t lint typecheck test build` | The same for every project (also `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` one target at a time) |
| `pnpm nx run-many -t publint attw` | The publish checks of every package (they build and pack first); `pnpm size` follows |
| `pnpm lint:files` | ESLint (`--max-warnings 0`) over every linted file type (TS, TSX, JS, JSX, Vue, HTML, CSS, SCSS, Markdown) outside the Nx projects: root configs, `tools/eslint/`, `tools/scripts/`, `docs/`, `.github/`, `.changeset/`. `packages/**` and `tools/workspace-plugin/**` are covered by their project `lint` targets. Run by `pnpm ci:local` |
| `pnpm changeset add` | Add a changeset |
| `pnpm nx g @cocokits/workspace:library` | The library generator ([generators.md](./generators.md)) |

## Git hooks

- pre-commit: lint-staged runs ESLint and Prettier on the staged files only (Markdown, HTML, CSS and SCSS get the file-size rule).
- commit-msg: commitlint checks the message.

## Target defaults

`nx.json` sets caching and `dependsOn` for the targets above: `build` depends on `^build`, `typecheck` and `test` depend on `^build`. Every `package.json` declares its workspace dependencies so the `^build` graph is complete. Nx Release is not used; Changesets owns versioning.
