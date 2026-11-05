# Contributing to CocoKits

Thank you for helping. CocoKits is a set of unstyled components for Angular, React (including Next.js) and Vue. This guide covers how to set up the repository, what a good change looks like, how to get it merged and how to report an issue. [`AGENTS.md`](AGENTS.md) is the short version for people and coding agents.

## Set up

You need Node in the range of `engines` in `package.json` (`.nvmrc` has the version used in CI) and pnpm, which Corepack installs at the `packageManager` version. Use pnpm only, never npm or yarn.

```bash
corepack enable
pnpm install
```

`pnpm install` also installs the git hooks (husky): ESLint and Prettier run on the staged files before a commit, and commitlint checks the commit message.

## Find your way

| Folder | Holds |
|---|---|
| `packages/` | The published packages: `utils`, `shared`, `cdk`, `machines`, the framework packages `angular`, `react`, `vue` with their `core` adapters, and `themes/<name>` |
| `tools/` | The workspace plugin (generator and extractor executors), shared ESLint configs and scripts |

A layer imports only from layers to its left: `utils, shared ← cdk ← machines ← <fw>-core ← <fw> components ← themes`. Every project has Nx targets (`lint`, `typecheck`, `test`, `build`); run one with `pnpm nx run <project>:<target>`.

## Make a change

1. Open or pick an issue. For a new component or a public API change, describe the API and the reference library it follows (Angular Material and CDK, Radix UI and Base UI, Reka UI) before you write code. The maintainers agree on the API first.
2. Search the repository for an existing solution before you add code, and keep the change as small as the requirement allows.
3. Create packages and entry points with the generator, never by hand: `pnpm nx g @cocokits/workspace:library --help`.
4. Write tests with the change and TSDoc on every public symbol.
5. Run the checks (below) and open the pull request.

## Run the checks

```bash
pnpm nx affected -t lint typecheck test build   # while you work
pnpm nx format                                  # fix formatting
pnpm ci:local --title "<PR title>"              # everything CI runs, before you open the pull request
```

`pnpm ci:local` runs format, lint, typecheck, test and build, then publint, Are the Types Wrong and size-limit, then commitlint. Pass `--base` with the branch your pull request targets. Do not silence a lint or boundary error; fix its cause, or ask when a rule seems wrong for your case.

## Commit messages and pull requests

Commit messages and pull request titles follow [Conventional Commits](https://www.conventionalcommits.org). commitlint enforces the format:

```
<type>(<scope>): <summary>

<body>
```

- `type` is one of `feat`, `fix`, `docs`, `perf`, `refactor`, `test` or `chore`.
- `scope` is the project the change is for, without the package prefix (`machines`, `angular/button`, `theme-cocokits`). It is required for every type except `chore`, which has none.
- The summary is imperative, present tense, not capitalised, with no full stop. Body lines are at most 100 characters.
- No `Co-Authored-By` trailer and no tool attribution line.
- Mark a breaking change with a `BREAKING CHANGE:` footer that explains how to migrate.

A pull request changes at most 50 files and does one thing; split larger work. The description says what changed and why, and lists the commands you ran with their results. Do not add changesets while 2.0.0 is unreleased; versions are set at the release.

## Report an issue

Open an issue on GitHub with the package and version, what you did, what you expected, what happened and a minimal reproduction. Search the open issues first.

## Security

Report vulnerabilities as described in [SECURITY.md](SECURITY.md), not in a public issue.

## License

By contributing you agree that your contribution is licensed under the [Apache License 2.0](LICENSE).
