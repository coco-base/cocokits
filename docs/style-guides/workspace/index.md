# Workspace guide (monorepo, packages, CI, release)

Scope: where code lives in the Nx + pnpm workspace and how it is built, checked and shipped. Code rules are in [framework-agnostic](../framework-agnostic/index.md); tests in [testing](../testing/index.md); cross-cutting rules in [architecture](../../architecture.md).

## Load on demand

| File | Load when |
|---|---|
| [targets.md](./targets.md) | Running any command; adding an Nx target or changing `nx.json`; adding a lint exception |
| [repo-layout.md](./repo-layout.md) | Placing a new file or package; reading the folder tree |
| [packages-and-entry-points.md](./packages-and-entry-points.md) | Naming a package, adding an entry point, editing `package.json` (`exports`, peers, builder), changing a peer range |
| [nx-tags-and-boundaries.md](./nx-tags-and-boundaries.md) | Setting project tags, fixing a boundary lint error, checking whether an import is allowed |
| [generators.md](./generators.md) | Running or changing the library generator |
| [ci-pipeline.md](./ci-pipeline.md) | Adding or fixing a CI job |
| [api-extraction.md](./api-extraction.md) | Changing an `api-docs` extractor, a TSDoc tag the extractors read, or the `api-parity` check |
