# Component lead workflow setup

Last reconciled: 2026-09-07, branch `feat/table`, starting HEAD `a2154329`.

## User decisions

- Full component work includes Angular, React, Frames X, CocoKits, both Storybooks,
  tests, browser checks, and screenshot comparison with supplied references.
- The lead delegates all product implementation, coordinates workers, writes or
  refines tests, runs validation, operates the browser, and requests repair cycles.
- Workers must reuse existing components, CDK, utilities, hooks, stores, types,
  tokens, styles, generators, assets, and established architecture.
- New architectural decisions require the user's input; following verified
  repository precedent does not.
- Progress is stored in Git-trackable repository files so a fresh lead can
  reconcile and resume the work.
- Worker models are `gpt-5.6-sol` for complex work, `gpt-5.6-terra` for standard
  work, and `gpt-5.6-luna` for easy bounded work.

## Setup scope

- `.agents/skills/cocokits-component-lead/`: skill, lead workflow, and task record
  templates.
- `AGENTS.md` and `ai-instructions/AI_SETUP.md`: default discovery and routing.
- `ai-work/components/README.md`: location and purpose of component work records.

## Validation evidence

- Independent Terra scenario evaluation passed design/dependency handling,
  stale-restart and incomplete-validation handling, and worker-role/reuse routing.
- The evaluation identified one model-unavailability handoff gap; the workflow now
  requires the lead to ask whether to wait or use a named allowed alternative.
- Main-agent review also corrected default resume routing, worker-role isolation,
  stale validation handling, architectural/design question escalation, and the
  distinction between deliberate implementation generation and validation outputs.
- The session was interrupted by a usage limit. On resumption, the lead read this
  record and current files, confirmed no previous workers remained active, and
  continued final validation without restarting implementation.
- Bundled skill-creator `quick_validate.py`: passed (`Skill is valid!`). PyYAML
  was installed in a temporary validation directory; project dependencies were
  unchanged. The check required access outside the sandbox to that directory.
- Installed Prettier checks passed for the skill, templates, routing, and work
  records. All 13 local links across nine Markdown files resolved.
- `git diff --check` passed. Codex's refreshed skill catalog included
  `cocokits-component-lead` from the repository's `.agents/skills` directory.
- No component was requested in this setup, so no Figma comparison or Storybook
  browser run is claimed. Those remain required acceptance steps for actual
  component creation.

## Current state

- Skill implementation and review: complete.
- Product component implementation: none requested or started.
- Delivery: include only this setup's nine files in a separate Git commit. Use
  `git log -- .agents/skills/cocokits-component-lead` to find its commit; no remote
  push is part of this setup.
- Next use: accept a component request with Frames X references and CocoKits
  appearance, create or reconcile its component work record, and follow the skill.
