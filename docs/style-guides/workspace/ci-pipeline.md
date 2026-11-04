# CI pipeline

The workflows in `.github/workflows` and the local run that reproduces them. Commands: [targets.md](./targets.md). Why: [tooling](../../why/tooling.md#one-pipeline-run-in-ci-and-locally).

## `ci.yml`

Runs on a pull request to `next` or `main` and on a push to `next` or `main`. A newer run of the same ref cancels an older one. Steps, in order:

1. `pnpm install --frozen-lockfile`
2. `nx format:check`
3. `pnpm lint:files` (ESLint over the linted file types outside the Nx projects, see [targets.md](./targets.md))
4. `lint`, `typecheck`, `test` and `build`: `nx affected` against the base branch on a pull request, `nx run-many` on a push
5. `publint` and `attw` on the packed packages, with the same split
6. `pnpm size` after building every project
7. On a pull request, a second job runs commitlint over the commits since the base

`pr-title.yml` runs commitlint on the title of the pull request (squash merges use it as the commit message). `generator-verify.yml` is manual: the slow buildability check of the library generator.

## `pnpm ci:local`

`tools/scripts/ci-local.mjs` runs the same list on your machine and stops at the first failure. Run it before you push a pull request:

```bash
pnpm ci:local --title "<PR title>"
```

Its steps are the ones above, plus `tools/scripts/verify-library-generator.mjs` when the diff `<base>...HEAD` touches a path in `GENERATOR_PATHS` in the script, or with `--all`.

| Flag | Meaning |
|---|---|
| `--base <ref>` | What the change is compared against. Default `origin/main`; use `origin/next` while `next` is open |
| `--title "<title>"` | The pull request title to check. Required when the run is for a pull request |
| `--all` | Run the generator check even when no generator path changed |

Known flakes under parallel load: `workspace:test` timeouts (`dependency-cycles.spec`, `api-docs-*.spec`) and `machines:cycles` ENOENT. Re-run the failed target alone (`pnpm nx run <project>:<target>`), then `pnpm ci:local` again. There is no retry in the script.

## Rules

- Do not add a new runner, builder or release mechanism; extend the existing one.
- A check added to the workflow is added to `tools/scripts/ci-local.mjs` in the same change.
