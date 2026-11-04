# Workspace generators

The only way to create packages and entry points. Only the `library` generator exists; there are no component scaffolding generators. Why: [tooling](../../why/tooling.md#one-library-generator-for-packages-and-entry-points).

It lives in `tools/workspace-plugin` (`@cocokits/workspace`) and runs as `nx g @cocokits/workspace:library <name> --kind=<kind>`. Kinds, options and examples: [tools/workspace-plugin/README.md](../../../tools/workspace-plugin/README.md). Templates are EJS files under `src/generators/library/files/`.

It produces `project.json` with `layer`/`scope`/`type` tags, the `exports` key, tests and lint setup, and a `size-limit.config.mjs` entry.

## Rules

- Scaffold packages and entry points with the generator and run `nx format` afterwards. Never hand-create `project.json`, `exports` keys or tags.
- Never hand-edit generated files such as `size-limit.config.mjs` or the `exports` key; re-run or fix the generator instead.
- A generator runs once; its output is then normal source code. Theme framework layers get their scaffold from the generator (`theme-fw`); their source is written by hand.
- A new generator is added only when the same files have been written by hand repeatedly.
- When `tools/workspace-plugin/**` changes, CI builds the generator output in a temporary workspace ([ci-pipeline.md](./ci-pipeline.md)).
