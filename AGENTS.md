# AGENTS.md: CocoKits

Instructions for every coding agent and for humans. `CLAUDE.md` imports this file.

CocoKits is a set of unstyled components for Angular, React (incl. Next.js) and Vue; only these three are supported.
Behaviour is written once in framework-free code, thin framework adapters bind it, and themes style every framework the same way.

## Navigate

1. Load `INDEX.md`.
2. Load only the skill and the guide `index.md` it names for your task, then only the topic files the task needs.
3. Rules are in `docs/architecture.md` and the guides; where a guide disagrees, `architecture.md` wins; report the conflict. Reasons are in `docs/why/`: read one only when you need the reason or want to change a rule.

## Guardrails

- Layers, imports and entry points: [architecture §2](docs/architecture.md#2-layers-and-packages). Framework-free and SSR-safe layers: same section.
- Styling contract (classes and `data-*` are public API): [architecture §3](docs/architecture.md#3-anatomy-and-the-styling-contract).
- Accessibility: [architecture §7](docs/architecture.md#7-accessibility).
- Simplicity and reuse: search for an existing solution before writing code, keep it as small as the spec allows, use the framework's own mechanism, never duplicate or restate a fact, name values for what they are ([architecture §10](docs/architecture.md#10-simplicity-and-reuse)).
- Never hand-edit generated files; re-run the target.
- Changing a rule means updating its why file in `docs/why/` in the same commit. Write a why entry only when the reason is not obvious from the rule itself.
- Commits, changesets, branches, pushes, PRs and review comments: skill `shipping-changes`; read it before you commit or push.
- pnpm only, never npm or yarn.
- Packages and entry points come from the library generator, never by hand ([generators.md](docs/style-guides/workspace/generators.md)).
- Never claim a check you did not run. Ask when a rule conflicts with the task; never silence lint or boundary errors (a rule that needs an exception: [lint exceptions](docs/style-guides/workspace/targets.md#lint-exceptions)); no source or doc file over 500 lines of code.

## Commands

All commands that exist are in `docs/style-guides/workspace/targets.md`. Daily ones:

```bash
pnpm install
pnpm nx affected -t lint typecheck test build   # local check set
pnpm nx format                                  # fix formatting
```

Finish a change with the `reviewing-code` skill.

## Factory

Jobs (component, change, bug, theme, doc, cdk) run through `/factory` (skill `factory`). Project status is in `factory/progress.md`. At the end of every session that did repo work, append a retro entry to `factory/retro.md` (skill `logging-retro`).

Fresh worktree setup: `pnpm install`. The docs site and preview apps start with the commands in `docs/style-guides/docs/site-architecture.md`.
