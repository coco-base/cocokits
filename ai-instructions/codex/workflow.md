# Development and maintenance workflow

Commands run from the repository root unless noted. This guide describes the
repository's configured workflow; see [baseline](baseline.md) for what was actually
run during onboarding and environment-specific failures.

## Setup and project discovery

`package.json` declares pnpm 9.12.1 and Node ranges
`^20.19.0 || ^22.12.0 || ^24.0.0`. Use the declared package manager and lockfile;
do not casually regenerate the lockfile or upgrade dependencies. CI currently
specifies Node 22.17 / pnpm 10.9 and installs without a frozen lockfile, which is
an existing discrepancy to investigate for dependency-tooling work.

```text
pnpm install --frozen-lockfile
pnpm exec nx show projects
pnpm exec nx show project @cocokits/react-button --json
```

Inspect `project.json` plus resolved targets before choosing commands: React
Button has build/typecheck but no test target at the onboarding baseline; common
utils has an inferred Vitest test target. Angular libraries often have no tests.

If installed dependencies are usable but the pnpm launcher cannot switch versions,
direct local entry points can help diagnose/run bounded checks without changing
dependency policy:

```powershell
$env:NX_DAEMON = 'false'
$env:NX_ISOLATE_PLUGINS = 'false'
node node_modules/nx/bin/nx.js show projects --json
node node_modules/vitest/vitest.mjs run --config packages/common/utils/vite.config.ts packages/common/utils/src/lib/data-source
```

Use those Nx flags for a reproducible foreground run when daemon/plugin isolation
causes trouble; they need not become global settings. Direct Nx commands may still
invoke pnpm inside custom executors. A sandbox `spawn EPERM` is an execution
restriction, not a test assertion failure; retry through the environment's normal
permission mechanism where authorized, and report any remaining limitation.

## Validation matrix

Replace example projects/files with the changed area. Quote a whole target name
when needed by the shell; `quick-fix-eslint` without `--fix` is a lint check.

| Change                         | Smallest useful validation                                                                                                                      |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Angular behavior/API           | `pnpm exec nx run @cocokits/angular-button:build`; package `:quick-fix-eslint`; relevant interaction story and available regression tests       |
| React behavior/API             | `pnpm exec nx run @cocokits/react-button:build`; resolved `:typecheck` if useful; package `:quick-fix-eslint`; relevant interaction story/tests |
| Shared prop/class contract     | `pnpm exec nx run @cocokits/core:test`; representative Angular/React builds and both themes                                                     |
| Shared algorithm/data source   | `pnpm exec nx run @cocokits/common-utils:test`; use the direct Vitest command above for a focused folder                                        |
| Theme SCSS/config              | Theme `:build-css` or `:build`, addon `:css-generator` as relevant, Stylelint on changed SCSS, visual states/modes                              |
| Token JSON                     | Parse/validate changed source; theme `:token-generator`, downstream CSS regeneration and visual inspection                                      |
| Component docs / shared addon  | Relevant `:build-storybook` and browser inspection; both apps for shared behavior                                                               |
| Generator/executor             | Inspect/run the owning project's available test target, focused fixture/snapshot tests, and generator dry-run                                   |
| Agent guidance / Markdown only | Prettier on edited Markdown, local links/paths, commands against config, and `git diff --check`; no component build required                    |

Focused formatting examples:

```text
pnpm exec prettier --check AGENTS.md "ai-instructions/codex/*.md"
pnpm exec stylelint packages/themes/frames-x/src/styles/scss/_button.scss
pnpm exec nx run @cocokits/angular-button:quick-fix-eslint
```

Prettier specifies two spaces, single quotes, 120 columns, ES5 trailing commas,
and CRLF. Match local ESLint config/import ordering. Avoid repository-wide format
or autofix commands for a small change. Existing hooks match `.ts`, `.scss`, and
`.json` but do not cover `.tsx` or Markdown, so run relevant checks explicitly.

Vitest config lives in shared core/utils/icons and workspace-plugin projects.
`passWithNoTests` is enabled in some configs; report actual tests executed.
Do not add meaningless tests for documentation-only edits or equate a Storybook
build with accessibility/interaction verification.

## Broader checks and CI

PR CI runs these against `main` (ensure the comparison ref exists):

```text
pnpm exec nx run cocokits:depcheck
pnpm nx affected:build --base=main --head=HEAD --exclude=website --parallel=4
pnpm nx affected:test --base=main --head=HEAD --exclude=cocokits,website --parallel=1
```

For uncommitted work, choose Nx affected flags matching the working-tree scope
or run explicit projects; a `--head=HEAD` comparison alone describes committed
changes. Root `cocokits:build-all` and `cocokits:test-all` are broad checks used by
main-branch CI. Use them for workspace-wide changes after focused checks, not as
the default edit loop.

Root `cocokits:quick-fix-eslint` expands to many projects and exclusions. The
lint-staged affected command can reach this broad target. Do not assume its name
means it only touches the staged file. Always inspect `git diff` after hooks.

## Changesets, commits, and release work

For a releasable package change, run `pnpm changeset add` and select actual package
names: patch for fixes, minor for compatible features, major for breaking APIs.
Do not hand-bump versions during ordinary development. Root `.changeset/config.json`
uses `main` as the base and no linked/fixed groups; package `publishConfig` also
matters (several publish publicly from `dist`).

`commitlint.config.ts` permits `feat`, `fix`, `docs`, `perf`, `refactor`, `test`,
`chore`, and `story`. All except `chore`/`story` need a valid project/package scope
without `@cocokits/`; **chore/story must not have a scope**. Framework-shared package
suffixes are also derived as scopes. Examples:

```text
fix(angular-form-field): preserve disabled state on reset
docs(cocokits): document repository maintenance workflow
chore: update workspace tooling
story: add select keyboard example
```

Use a body explaining motivation for non-doc commits, following the contribution
docs. Stage task-owned files and inspect `git diff --cached`. Hooks run lint-staged
and commitlint; commitlint itself calls `pnpm nx show projects --json` to resolve
scopes. Keep hooks enabled for normal work. If a hook cannot run, report the exact
cause; the initial onboarding snapshot's bypass is not a standing instruction.

Before release/publish/deployment, inspect the current scripts and task scope.
Root `release` delegates to a sibling checkout outside this repo. Do not run it
as a validation step. Similarly, `local-registry-quick-fix` changes npm's registry
configuration and clears local registry storage; it is not a routine setup command.
The root `reset` script contains `pnpm install?` and calls a cleanup script; do not
recommend it as the ordinary fix for installation trouble.

## Keep context useful

After changing an architectural contract or workflow, update the corresponding
guide and root routing only if needed. Record newly observed failures with date,
command, and outcome in `baseline.md`; remove or mark resolved observations when
verified. Keep task-specific notes out of global machine configuration. Consumer
AI instruction files remain separate from this maintainer guidance.
