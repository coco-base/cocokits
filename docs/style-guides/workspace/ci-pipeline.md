# CI pipeline

The workflows in `.github/workflows` and the local run that replaces them. Commands: [targets.md](./targets.md).

The workflows are manual-only (`workflow_dispatch`); nothing runs on a push or a pull request, so no CI minutes are paid. Instead every PR runs the whole pipeline locally with `pnpm ci:local` before it is pushed ([shipping-changes](../../../.claude/skills/shipping-changes/SKILL.md#open-a-pr)). Why: [tooling](../../why/tooling.md#the-pipeline-runs-locally-and-the-workflows-are-manual).

## `pnpm ci:local`

`tools/scripts/ci-local.mjs` is the one owner of the list of checks. It stops at the first failure and prints each step name:

1. `pnpm install --frozen-lockfile`
2. `nx format:check`
3. `pnpm lint:files` (ESLint over all linted file types outside the Nx projects, see [targets.md](./targets.md))
4. `nx affected -t lint typecheck test build --base=<base>`
5. commitlint over the commits `<base>..HEAD`
6. commitlint of the PR title, only with `--title`
7. `tools/scripts/verify-library-generator.mjs` (slow buildability check of the library generator), only when the diff `<base>...HEAD` touches a path in `GENERATOR_PATHS` in the script, or with `--all`

| Flag | Meaning |
|---|---|
| `--base <ref>` | What the change is compared against. Default `origin/main`; for a stacked PR the previous branch |
| `--title "<title>"` | The PR title to check. Required when the run is for a PR |
| `--all` | Run the generator check even when no generator path changed |

Known flakes under parallel load: `workspace:test` timeouts (`dependency-cycles.spec`, `api-docs-*.spec`) and `machines:cycles` ENOENT. Re-run the failed target alone (`pnpm nx run <project>:<target>`), then `pnpm ci:local` again. There is no retry in the script.

## Workflows (manual)

Run them from the Actions tab or with `gh workflow run <name>` when something must be checked on GitHub.

- **`ci.yml`**: input `base` (default `main`). `check`: `nx format:check`, `pnpm lint:files`, `nx affected -t lint typecheck test build` against `origin/<base>`. `commits`: commitlint over `origin/<base>` to the run's commit.
- **`pr-title.yml`**: required input `title`, checked with commitlint.
- **`generator-verify.yml`**: runs `tools/scripts/verify-library-generator.mjs`, no inputs.

## Rules

- Do not add a new runner, builder or release mechanism; extend the existing one.
- A check added to a workflow is added to `tools/scripts/ci-local.mjs` in the same change.
