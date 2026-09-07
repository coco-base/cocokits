# Cocokits repository guidance

## Start here

Cocokits provides unstyled, composable UI components for **Angular and React**, with
**Frames X** (`frames-x`) and **CocoKits** (`cocokits`) themes. Documentation is
Storybook with a substantial custom UI. Preserve the separation between component
behavior, shared selector contracts, theme appearance, and documentation tooling.

Before editing, check `git status --short`, read the relevant guide below, then
inspect the target implementation, its exports, `project.json`, and nearby examples.
Do not rescan the entire repository for each task. These guides are a navigation
map, not a substitute for checking the source you will change.

| Task                                                        | Read                                                                    |
| ----------------------------------------------------------- | ----------------------------------------------------------------------- |
| Find ownership, dependencies, or entry points               | [Architecture](ai-instructions/codex/architecture.md)                   |
| Develop or fix Angular/React components and utilities       | [Components](ai-instructions/codex/components.md)                       |
| Change appearance, theme configuration, or tokens           | [Themes](ai-instructions/codex/themes.md)                               |
| Write documentation, stories, examples, or fix the docs UI  | [Storybook](ai-instructions/codex/storybook.md)                         |
| Run, test, lint, generate, commit, or prepare a release     | [Workflow](ai-instructions/codex/workflow.md)                           |
| Investigate setup failures or incomplete areas              | [Onboarding baseline](ai-instructions/codex/baseline.md)                |
| Create or resume a component from design through validation | [Component lead skill](.agents/skills/cocokits-component-lead/SKILL.md) |

## Working rules

- Use the component lead skill for any request to create or resume component work.
  Unless the user narrows the scope, creation includes Angular, React, Frames X,
  CocoKits, both Storybooks, tests, and browser validation. The lead delegates
  product code and independently validates it. A worker explicitly assigned by
  that lead executes its bounded implementation directly and does not invoke the
  lead workflow again. A narrow component bug fix remains a normal scoped task.

- Keep framework-neutral contracts in `packages/common/core` (`@cocokits/core`)
  and shared helpers in `packages/common/utils`. Do not import Angular/React into
  shared packages or import one framework's implementation into the other.
- Component packages own behavior, composition, accessibility, and essential
  layout. Theme packages own colors, typography, spacing, and visual variants.
  Essential component SCSS already exists; “unstyled” does not mean “no CSS.”
- Preserve the shared `cck-*` selector/DOM contract. A change to element names,
  class generation, or structure requires checking both themes and both framework
  implementations. Do not assume feature parity; identify the actual impact.
- Use theme configuration for valid `type`, `size`, `color`, and `additional`
  values. Preserve `null` versus `undefined` semantics: most props allow opting
  out of defaults with `null`, but shared core currently defaults `type: null`.
  Check the resolver before changing this behavior or documenting it. Do not
  invent props or apply values from one theme to the other.
- Use public package imports and maintain `src/index.ts`, package dependencies,
  and public exports when adding APIs. Umbrella `*-components` exports are not
  currently exhaustive. Check before recommending an import to a consumer.
- Edit original SCSS, token JSON, example templates, and utility JSDoc; regenerate
  derived CSS, `_story.source.ts`, and TypeDoc MDX through their existing targets.
  Review the resulting diff because generators write tracked source directories.
- Follow the local component/store conventions. Preserve native attributes,
  refs, events, focus, disabled/read-only behavior, form integration, and cleanup.
- For behavior changes, add a focused regression test where a harness exists.
  Run affected builds/lint and relevant stories. A target that passes with no
  tests is not behavior coverage. State what was and was not verified.
- Update public JSDoc (including useful `@example`), stories, and a Changeset for
  releasable package behavior/API changes. Agent guidance alone needs no package
  version bump. Use the workflow guide for commit conventions.
- Preserve unrelated user changes. Stage only task-owned files in normal work;
  the all-files snapshot made during onboarding was a one-time user request.
- Keep this guidance current when commands, ownership, generators, or contracts
  change. Put durable facts in the appropriate guide and dated observations in
  `baseline.md`; do not turn transient failures into permanent architecture rules.

## Commands at a glance

Use the repository's pnpm workspace and installed Nx, from the repository root.
`package.json` declares pnpm **9.12.1**; see the workflow/baseline notes for existing
CI and local package-manager discrepancies. There is no root `npm test` script.

```text
pnpm install --frozen-lockfile
pnpm exec nx show project @cocokits/angular-button --json
pnpm exec nx run @cocokits/angular-button:build
pnpm exec nx run @cocokits/react-button:build
pnpm exec nx run @cocokits/common-utils:test
pnpm exec nx run @cocokits/angular-button:quick-fix-eslint
pnpm exec nx run @cocokits/angular-kits-doc:storybook --port=6006
pnpm exec nx run @cocokits/react-kits-doc:storybook --port=6007
```

Resolve project names/targets with `nx show project`; plugins infer targets beyond
those written in `project.json`. Run the smallest relevant checks first. See
[Workflow](ai-instructions/codex/workflow.md) before using broad targets or scripts.

## Code Review Rules

- Flag broken selector/DOM compatibility with themes, accidental framework
  dependencies in shared packages, and incorrect public import/export claims.
- Flag regressions in keyboard access, focus restoration, event/ref forwarding,
  form state, and disposal of listeners, subscriptions, or overlays.
- Check that runtime stories and displayed source examples describe the same API.
- Check regeneration and release notes for public changes; do not require broad
  unrelated refactors or framework parity work for a scoped fix.
