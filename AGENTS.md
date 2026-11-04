# AGENTS.md: CocoKits

Instructions for every coding agent and for humans. `CLAUDE.md` imports this file.

CocoKits is a set of unstyled components for Angular, React (including Next.js) and Vue; only these three are supported. Behaviour is written once in framework-free code, thin framework adapters bind it, and themes style every framework the same way. The 1.x code is on the `v1` branch. This branch, `next`, is the 2.0 rewrite.

## Packages

| Package | Holds |
|---|---|
| `@cocokits/utils` | Stateless helpers every other layer uses |
| `@cocokits/shared` | Contracts: anatomy, component meta, `ThemeConfig`, theme attributes, change details, mode collections |
| `@cocokits/cdk` | Framework-free building blocks (focus, dismissal, positioning, presence, form participation), one subpath per module |
| `@cocokits/machines` | Behaviour of one component each (anatomy, meta, state, keyboard, props), one subpath per component |
| `@cocokits/angular-core`, `@cocokits/react-core`, `@cocokits/vue-core` | The adapter that runs a machine in one framework, the overlay portal and the theme runtime |
| `@cocokits/angular`, `@cocokits/react`, `@cocokits/vue` | Unstyled components with fixed `cck-` classes and `data-*` attributes, one subpath per component |
| `@cocokits/theme-cocokits`, `@cocokits/theme-frames-x` | A theme: `ThemeConfig`, CSS and tokens, framework-free |
| `@cocokits/theme-<name>-angular`, `-react`, `-vue` | The thin typed theme layer of one theme in one framework |

Tools: `tools/workspace-plugin` (the `library` generator and the extractor executors), `tools/eslint` (shared lint configs), `tools/scripts` (CI and release scripts). Folders and paths: [repo-layout](docs/style-guides/workspace/repo-layout.md).

## Layers and imports

```
utils, shared  ←  cdk  ←  machines  ←  <fw>-core  ←  <fw> components  ←  themes
```

A layer imports only from layers to its left. utils and shared import nothing internal; the first four layers import no framework and touch no `window` or `document` at import time. Import a package from its root, or from a subpath only where the [entry-point table](docs/style-guides/workspace/packages-and-entry-points.md) lists one. Lint enforces both ([tags and boundaries](docs/style-guides/workspace/nx-tags-and-boundaries.md)); never silence it.

## When to change what

| You change | Where |
|---|---|
| Behaviour, keyboard, ARIA, state, props of a component | `packages/machines/<name>` |
| A shared behaviour block (focus, overlay, form) | `packages/cdk/<module>` |
| How one framework binds a machine | `packages/<fw>-core` or `packages/<fw>/<component>` |
| How a component looks | The theme: `packages/themes/<name>` (CSS, tokens, `ThemeConfig`). The base never takes a visual-only prop |
| A class or `data-*` name, a part, or the nesting of parts | Public API: a breaking change, see [architecture §3](docs/architecture.md#3-anatomy-and-the-styling-contract) |
| A new package or entry point | The `library` generator, never by hand ([generators](docs/style-guides/workspace/generators.md)) |

Search for an existing solution before you write code, keep it as small as the requirement allows, use the framework's own mechanism, and never restate a fact ([architecture §10](docs/architecture.md#10-simplicity-and-reuse)). Never hand-edit generated files; re-run the target.

## Commands

pnpm only, never npm or yarn. All commands that exist are in [targets.md](docs/style-guides/workspace/targets.md). Daily ones:

```bash
pnpm install
pnpm nx affected -t lint typecheck test build   # local check set
pnpm nx run-many -t publint attw                # the publish checks (then: pnpm size)
pnpm nx format                                  # fix formatting
pnpm ci:local --title "<PR title>"              # the whole CI list, before a PR
```

## Commits, branches and pull requests

- While `next` is open, branch from `next` and open pull requests into `next`. `main` keeps the 1.x line until 2.0.0 is released.
- A pull request changes at most 50 files and does one thing. Split larger work.
- Commits and PR titles are conventional: `type(scope): subject` with the project name as scope (`fix(machines): ...`). `feat`, `fix`, `docs`, `perf`, `refactor` and `test` need a scope; `chore` has none. Body lines are at most 100 characters. No `Co-Authored-By` trailer and no tool attribution line (commitlint rejects them).
- No changesets until the 2.0.0 release; the first release is cut from the fixed version group in `.changeset/config.json`.
- Never skip hooks (`--no-verify`). Never push to `main`.
- A pull request states the commands you ran and their results. Never claim a check you did not run.

## Where the rules are

Rules are in [architecture.md](docs/architecture.md) and the guides in `docs/style-guides/` (framework-agnostic, Angular, React, Vue, themes, testing, accessibility, workspace). Where a guide disagrees with `architecture.md`, `architecture.md` wins; report the conflict. The reasons are in `docs/why/`: read one only when you need the reason or want to change a rule. Changing a rule means updating its why file in the same commit. Terms: [glossary](docs/glossary.md). No source or doc file is over 500 lines of code. Contributing guide for people: [CONTRIBUTING.md](CONTRIBUTING.md).
