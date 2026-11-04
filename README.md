# CocoKits Next

Unstyled components for Angular, React (including Next.js) and Vue. Behaviour is written once as framework-free machines. Thin adapters bind it to each framework. Themes style every framework the same way.

Agents and humans start at [AGENTS.md](./AGENTS.md), then [INDEX.md](./INDEX.md). Rules are in `docs/architecture.md`, reasons in `docs/why/`.

## Prerequisites and setup

- Node, in the range of `engines` in `package.json`.
- pnpm, through corepack. The version is the `packageManager` field. Use pnpm only, never npm or yarn.

```bash
corepack enable
pnpm install
```

`pnpm install` also installs the git hooks (husky, through `prepare`).

## Repository layout

Source lives under `packages/`, tooling under `tools/`. Details: [repo-layout.md](./docs/style-guides/workspace/repo-layout.md).

| Project                  | Package                            | Path                               | Layer        |
| ------------------------ | ---------------------------------- | ---------------------------------- | ------------ |
| `utils`                  | `@cocokits/utils`                  | `packages/utils`                   | utils        |
| `shared`                 | `@cocokits/shared`                 | `packages/shared`                  | shared       |
| `cdk`                    | `@cocokits/cdk`                    | `packages/cdk`                     | cdk          |
| `machines`               | `@cocokits/machines`               | `packages/machines`                | machine      |
| `angular-core`           | `@cocokits/angular-core`           | `packages/angular/core`            | fw-core      |
| `react-core`             | `@cocokits/react-core`             | `packages/react/core`              | fw-core      |
| `vue-core`               | `@cocokits/vue-core`               | `packages/vue/core`                | fw-core      |
| `angular`                | `@cocokits/angular`                | `packages/angular`                 | fw-component |
| `react`                  | `@cocokits/react`                  | `packages/react`                   | fw-component |
| `vue`                    | `@cocokits/vue`                    | `packages/vue`                     | fw-component |
| `theme-cocokits`         | `@cocokits/theme-cocokits`         | `packages/themes/cocokits/core`    | theme        |
| `theme-cocokits-angular` | `@cocokits/theme-cocokits-angular` | `packages/themes/cocokits/angular` | theme        |
| `theme-cocokits-react`   | `@cocokits/theme-cocokits-react`   | `packages/themes/cocokits/react`   | theme        |
| `theme-cocokits-vue`     | `@cocokits/theme-cocokits-vue`     | `packages/themes/cocokits/vue`     | theme        |

Layers import only from layers to their left: `utils, shared ← cdk ← machines ← <fw>-core ← <fw> components ← themes`.

## Daily commands

All targets that exist are listed in [targets.md](./docs/style-guides/workspace/targets.md).

```bash
pnpm nx affected -t lint typecheck test build   # before every push
pnpm nx run-many -t lint typecheck test build   # everything
pnpm nx run <project>:<target>                  # one project, for example: pnpm nx run machines:test
pnpm nx format:check                            # check formatting
pnpm nx format                                  # fix formatting (pnpm format)
pnpm changeset add                              # every releasable change
```

## Creating packages and entry points

Never create packages or entry points by hand; use the `library` generator ([generators guide](./docs/style-guides/workspace/generators.md)). For example, a machine entry point `@cocokits/machines/switch`:

```bash
pnpm nx g @cocokits/workspace:library switch --kind=machine
```

Run `pnpm nx format` afterwards. All kinds and options: [tools/workspace-plugin/README.md](./tools/workspace-plugin/README.md) and [generators.md](./docs/style-guides/workspace/generators.md).

## Git workflow

1. Branch off `main`.
2. The PR description lists the commands you ran with their results.

Git hooks:

- pre-commit: ESLint and Prettier on the staged files only (lint-staged).
- commit-msg: commitlint checks the message.

The GitHub workflows are manual-only. Before every PR push run `pnpm ci:local --title "<PR title>"`, which runs the whole pipeline locally ([ci-pipeline.md](./docs/style-guides/workspace/ci-pipeline.md)).

## Current state

The packages are empty scaffolds: no components, machines or cdk modules exist yet.

## Local scratch folder

`.tmp/` is a git-ignored scratch folder for local output.
