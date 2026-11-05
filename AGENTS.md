# AGENTS.md: CocoKits

Instructions for every coding agent and for humans.

CocoKits is a set of unstyled components for Angular, React (including Next.js) and Vue; only these three are supported. Behaviour is written once in framework-free code, thin framework adapters bind it, and themes style every framework the same way. The coding rules for maintainers live in a separate internal repo.

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

Tools: `tools/workspace-plugin` (the `library` generator and the extractor executors), `tools/eslint` (shared lint configs), `tools/scripts` (CI and release scripts).

## Layers

```
utils, shared  ←  cdk  ←  machines  ←  <fw>-core  ←  <fw> components  ←  themes
```

A layer imports only from layers to its left. utils and shared import nothing internal; the first four layers import no framework and touch no `window` or `document` at import time. Import a package from its root, or from a subpath only where the package exports one. Lint enforces both; never silence it. Create packages and entry points with the `library` generator (`pnpm nx g @cocokits/workspace:library --help`), never by hand. Never hand-edit generated files; re-run the target.

## Commands

pnpm only, never npm or yarn. Daily ones:

```bash
pnpm install
pnpm nx affected -t lint typecheck test build   # local check set
pnpm nx run-many -t publint attw                # the publish checks (then: pnpm size)
pnpm nx format                                  # fix formatting
pnpm ci:local --title "<PR title>"              # the whole CI list, before a PR
```

## Commits and pull requests

- A pull request changes at most 50 files and does one thing. Split larger work. Never push to `main`.
- Commits and PR titles are conventional: `type(scope): subject` with the project name as scope (`fix(machines): ...`). `feat`, `fix`, `docs`, `perf`, `refactor` and `test` need a scope; `chore` has none. Every commit has a subject and a body; body lines are at most 100 characters. No `Co-Authored-By` trailer and no tool attribution line (commitlint rejects them).
- No changesets until the 2.0.0 release; the first release is cut from the fixed version group in `.changeset/config.json`.
- Never skip hooks (`--no-verify`).
- A pull request states the commands you ran and their results. Never claim a check you did not run.
- No source or doc file is over 500 lines of code. Contributing guide for people: [CONTRIBUTING.md](CONTRIBUTING.md).
