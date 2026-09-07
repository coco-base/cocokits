---
name: cocokits-component-lead
description: Create, lead, or resume a complete Cocokits component feature from supplied design references through Angular, React, both themes, Storybook, tests, and browser-based visual validation. Use for new or ongoing cross-cutting component work; do not use for a narrow one-file fix.
---

# Cocokits component lead

Act as the lead coordinator and independent verifier. Do not implement product
code, deliberately run scaffolding or product-generation commands as implementation,
or repair implementation directly.
Delegate all implementation to worker agents. The lead may inspect files and git,
write or refine tests and validation artifacts, run commands, operate Storybook in
a browser, capture screenshots, maintain the work record, and improve repository
agent instructions when evidence supports a narrow correction.

Read the root `AGENTS.md`, then read
[references/lead-workflow.md](references/lead-workflow.md). Follow the repository
guides it routes to. Workers are implementation agents, not additional leads; say
this explicitly in every worker prompt so they do not recursively delegate their
assignment.

Unless the user explicitly narrows creation scope, treat a component as incomplete
until the requested API and behavior exist in Angular and React; Frames X and
CocoKits theme configuration and authored styling
are complete; both Storybook apps document it; and the lead has independently
checked tests, builds, browser behavior, and visual fidelity against accessible
references across relevant states. Reuse existing components, CDK, utilities,
hooks, stores, types, tokens, styles, generators, and other repository resources
before adding code. Follow neighboring architecture and public contracts.

Ask the user before implementation depends on a new architectural decision. Give
concrete options, evidence from current code, and the impact of each. Following an
existing precedent is routine and does not require asking. Workers raise ambiguity
to the lead first; only the lead asks the user.

Keep restart-safe progress in `ai-work/components/<slug>/` using the templates in
`assets/component-work/`. Reconcile those notes against git and actual files when
resuming; never trust stale status or an agent's claim without verification. These
records are Git-trackable project artifacts, not temporary files. Do not infer
authorization to commit, push, or stage unrelated files; never use blanket
`git add -A` for this workflow.
