# Why: the factory workflow

Rules: the [factory skill](../../.claude/skills/factory/SKILL.md), [creating-components](../../.claude/skills/creating-components/SKILL.md), the shipping-changes skill and [architecture §10](../architecture.md#10-simplicity-and-reuse). This file explains them and states no rules.

## One loop for every job

**Rejected alternatives.**

- _One agent does everything in one conversation._ Context fills up, and the agent reviews its own work.

**Why.** Each step is a separate agent that reads files and writes one file. A step can be repeated or resumed without the rest of the conversation, and a reviewer never sees the builder's reasoning, only its result.

## Research, interview and spec are one step, approved by a human

**Rejected alternatives.**

- _Interview first, research later._ The user is asked facts the agent can look up.
- _Build from the request._ Behaviour gets invented, which the creating-components rule forbids.

**Why.** Research settles the facts (APG pattern, WCAG, keyboard, reuse), so the interview asks only real decisions. A spec reviewed by a second model is the approved requirements. The maintainer approves only a component's public API before the build, because it is the part users depend on and the costly part to change; a spec for the story compiler, the docs or tooling is approved by its review alone (maintainer, 2026-10-30).

## A blocker goes to a brainstorm before the maintainer

**Rejected alternatives.**

- _Ask the maintainer at every blocker._ The job waits on a person for questions two models can settle.
- _One model decides._ Its own blind spots go unchecked.

**Why.** A Fable agent and the orchestrator agree on a solution, then a second vendor's model attacks it; when codex is unavailable a second Fable agent does, because the loop must not wait for a tool limit. Only a solution that changes a component's public API, or a disagreement, needs the maintainer (maintainer, 2026-10-30).

## Two phases per component

**Rejected alternatives.**

- _All three frameworks in one branch._ A design mistake is repeated three times before anyone sees it, and the review is three times as large.

**Why.** Phase A proves the machine, the Angular component, the theme and the docs page. Once that is merged, phase B ports a settled contract to React and Vue and is checked against Angular.

## Every review runs on a second model

**Rejected alternatives.**

- _Claude reviews Claude._ The same model tends to accept its own mistakes.
- _Wait when codex hits a usage limit._ The factory stalls for hours.

**Why.** Codex with the latest gpt-sol model reviews the spec and every lens. When codex is not available, Claude Opus takes that one review, so the loop keeps running. Fable is not used unless the maintainer says so; the review file records which engine wrote it.

## Builder resume budget of 4

**Rejected alternatives.**

- _Ask the maintainer after round 2._ The form-control jobs needed up to four fix rounds on one PR, and each stop at two left the job waiting while the maintainer was away.

**Why.** The maintainer set the budget to 4 on 2026-10-30. A real finding is cheaper to fix in the next round than to leave a stack of PRs idle, and a fifth failed round still reaches the maintainer. The number is stated once, in the [factory skill](../../.claude/skills/factory/SKILL.md).

## One skill owns commits, changesets, pushes and PRs

**Rejected alternatives.**

- _A skill for PRs and a guide for commits and changesets._ The two always change together, and two forms meant two places to read and two ways to extend them.

**Why.** Commit messages, changesets, branch and push rules, the PR title and body and the handling of review comments are one flow with one reader. One skill (`shipping-changes`) holds its rules and steps, so a reader loads one file. This is the exception to "rules live in a guide" in [writing-for-agents](../../.claude/skills/writing-for-agents/SKILL.md): rules used by exactly one workflow stay in that workflow's skill.

## One changeset per PR, a changelog section in the PR body

**Rejected alternatives.**

- _A changeset on every PR, empty when nothing is released._ Docs and agent guidance changes then carry noise files that release nothing.
- _A changeset per commit._ A PR with several commits would list the same change several times.

**Why.** A changeset exists to drive a release, so only a PR that changes a published package needs one, and one per PR is enough. The `## Changelog` section in the PR body tells the reviewer what users will see, and `None` says on purpose that nothing is released.

## Small PRs

**Rejected alternatives.**

- _One big PR per job._ It is hard to review, and fix loops on it run long.

**Why.** A small PR can be reviewed in one sitting and reverted without side effects. The limit and the split are in [shipping-changes](../../.claude/skills/shipping-changes/SKILL.md#pr-size).

## Every PR targets main

**Rejected alternatives.**

- _Open a stacked PR against the previous branch._ When the lower PR merged, the upper one stayed based on a branch that no longer led anywhere, and later PRs merged into the wrong base (#13, #30 to #35).

**Why.** A merge into a branch that is not `main` never reaches the release line. The price is that a stacked PR shows the files of the PRs below it until they merge. The rule: [shipping-changes](../../.claude/skills/shipping-changes/SKILL.md#open-a-pr).

## Simplicity and reuse

**Rejected alternatives.**

- _Let each agent build what its task needs from scratch._ Agents see one task, not the repo, so they write a second helper where one exists.
- _Review for duplication only after the build._ The duplicate is already wired in by then.
- _Design every component from scratch._ Each framework implementation then invents its own API shape and structure, and the result grows more complex than the proven headless libraries (Base UI, Angular Material and CDK, Reka UI).
- _Treat names and the choice of mechanism as taste._ One PR passed eleven review rounds with a setup function where Angular inherits from a base directive, a manual listener whose reason sat only in a code comment, a `computed` no caller could see, a class string copied from the anatomy and eight names that said only a kind. The maintainer found all of them. Another PR named one concept `placement` in the badge and `position` in its container, put the container's `position` on the badge, and passed it through an injection token where CSS on the container's `data-position` was enough. The Angular rule is in the [DI rules](../style-guides/angular/components-and-selectors.md#di-rules).

**Why.** Every extra helper, option or layer must be tested, documented and kept in line across three frameworks. A reviewer cannot see what was not written, so the search for an existing solution happens before the build and the review asks for the simpler form. Text follows the same rule: a rule stated in two files drifts, so each rule has one owner and pointers. Duplicated instructions crept in three times, so the code review searches the repo for every new or changed rule and reports a copy as a Major finding. The framework's own mechanism is the one the next reader already knows. For the same reason each framework implementation is compared with its proven reference library: it keeps our API familiar and simple, and a solution more complex than theirs needs a recorded reason. A copied fact drifts from its source while every test still passes. A concept keeps one name through every layer because each rename is a mapping the reader must learn and no test checks. Configuration lives on the component whose purpose it serves, so a child stays reusable and a parent change touches one file; CSS on the parent's own attributes needs no code, no token and no test of the channel. A helper that took one part name left two of the Badge's three parts without theme attributes, because the component called it for `root` only; a new part also meant an edit in every adapter. Looping over the anatomy inside the helper removes both, and a pure function cannot hide that kind of effect. A name is read far more often than it is written, and an exported name can only change in a major release, so review treats names and mechanisms as findings. The exception to "a base is for siblings of one component": the Input and the Textarea implement one control contract on different native elements, share about 300 lines of inputs, host bindings and logic per framework, and live in separate entries (one entry per component), where ng-packagr cannot share a relative file. A setup function would leave each class declaring the inputs and host bindings, which the Angular guide forbids, and a copy is the duplication this section exists to prevent, so an exported abstract base (`CckTextControlBase`, from the Input entry, marked not for direct use) is the simplest form that passes the guides. The Checkbox and the Switch had a second copy of the same forms-control logic (13 state inputs, touched/dirty/submitted, the FormField report, the tracking of a forms library), which only the model differs from, so that part is one abstract base, `CckFormControlBase`, and the text and checked bases extend it (its entry: [entry points](entry-points.md)). The rule also names what is fine, so review does not flag it: a field that names its own object (`name`), an established domain term (`block`, `element`) and a function named after the single value it returns (`dataAttr`); the maintainer accepted these in review.

## Internal members and current-code comments

**Why.** An Angular part reads its root through `inject`, so the root's coordination members (`register`, `theme`, `parts`) must be public, and a consumer who injects the root or queries it with `viewChild` sees them next to the real API. `@internal` keeps them off the API pages of the docs site, but the typings and the running object still carry them, so the `_` marks them where they are used, as Angular Material does. A `private`, `protected` or `#` member and code that is not published have no consumer to protect, so renaming them only adds churn. A plan row or job id in a comment goes stale as soon as the plan changes and says nothing about the code; `factory/` keeps that history. The rule: [architecture §10](../architecture.md#10-simplicity-and-reuse).

## Reference API per framework

**Rejected alternatives.**

- _One API shape for all three frameworks, for parity._ The first Dialog build made a declarative Angular dialog (`<ng-container cckDialog [(open)]>`) that Angular Material and the CDK do not have (they open a dialog from a service). Nothing in Material or the CDK supports it. Parity is a property of the rendered contract; the entry point is what an Angular, React or Vue developer already knows.
- _Compare after the API is approved._ Builders can then only record "differences, all from the approved spec". The comparison is a table in the spec, so the maintainer sees it before anything is built.
- _Accept any recorded reason for a deviation._ The same pipeline wrote the reason, so it always held. The reason "the story compiler can print it" shaped a component API. Only the maintainer approves a deviation, by question id.
- _Originality as "a different shape"._ Rules against copying wording and structure were read as "avoid their API". Originality means no copied code or prose.

**Why.** The rule existed during the first Dialog build but nothing gated it: the spec review, the API approval, the API review and the approver did not check it, and the originality wording pushed the other way. The agents conformed to the spec because the process rewarded that, and a later brainstorm repeated the mistake by keeping a shape with no precedent for repo parity. Now the table is required at each point where an API is decided or judged, a deviation needs a fetched precedent and an approved question id, and every proposal cites its precedent or says DEVIATION. A comparison written from memory hid a gap before, so an unfetched source blocks. The rule: [architecture §10 item 5](../architecture.md#10-simplicity-and-reuse).

## Review prompts, ledger and job typing

**Rejected alternatives.**

- _Short review prompts that name the spec as approved truth._ The reviewers then check conformance, not the rules. A prompt carries the lens Rules and Checklist verbatim, or the reviewer answers `PROMPT INCOMPLETE`.
- _Park an unmet spec requirement as a PR note or review only blockers in the last round._ Four requirements were parked this way (the Angular refusal, the Tabs server render, ids from values) and all lenses passed. An unmet requirement is a finding whatever a note says, and the orchestrator never narrows a round.
- _Type a job `doc` when it carries components._ A `doc` job has no grilling and no phase A review, so the API was judged by what the compiler can print. A job that creates or changes a public API is a `component` or `change` job.
- _One job for the compiler, nine cdk modules and six components in three frameworks._ No reviewer could hold it (579 files). One new component per component job.
- _A visual criterion checked by `toBeVisible` or box geometry._ A highlight hidden under a modal dialog passed, because Playwright's `toBeVisible` does not check what is painted on top. Use a hit test or a screenshot.
- _A maintainer sentence kept in the orchestrator's memory._ "Compare with them" became an unfetched gap list. `requirements.md` keeps each sentence verbatim with its spec line and review row, and the approver confirms each row.
- _Review in the builders' model family without saying so._ The same priors pass the same mistakes. The job records `sameFamilyReview` and the PR states it; the maintainer chose Opus as the fallback over waiting for codex.

**Why.** Each rule closes a step of the first Dialog build that let the drift through. They are stated once, in the [factory skill](../../.claude/skills/factory/SKILL.md), [review-engine](../../.claude/skills/factory/references/review-engine.md) and [job-files](../../.claude/skills/factory/references/job-files.md).

## Design fidelity

**Rejected alternatives.**

- _Let the spec describe the design in words and review only what changed._ The spec turned the design into text, nobody rendered the design next to the result, and later rounds re-checked deltas only.
- _Compare screenshots only._ Screenshots hide behaviour (sticky chrome, sync between controls) and exact values.

**Why.** A docs-site job drifted far from its design because no step compared the two. The maintainer wants the result to look and behave exactly like the design. Reading the design's code gives the exact values and behaviour, naming every intended difference makes any other difference a defect, and a side-by-side render by builder and reviewer in every round catches drift early. The design is a temporary input, so the comparison tooling is built per task in the job folder: a comparison script kept in the repo needed upkeep for a design nobody updates. The rule is stated once in the [factory skill](../../.claude/skills/factory/SKILL.md#design-fidelity).

## Skills carry no plan or status

**Rejected alternatives.**

- _Status notes in skills ("React comes in phase B", "not available yet")._ They go stale the day the plan moves, and each one forces a skill edit that changes no behaviour.

**Why.** A skill is a stable layer that teaches how to work; the plan is a layer on top of it. Mixing them makes a skill wrong as soon as the plan changes and hides real behaviour changes in status churn. The plan lives in `factory/progress.md`, the job files and the agent prompt, and a step that depends on what exists checks for it. Phase definitions are plan too, so they live only in the factory skill and `factory/progress.md`; other skills and the rule documents name conditions, and the factory prompt names the frameworks a job builds. The rule is stated once in [writing-for-agents](../../.claude/skills/writing-for-agents/SKILL.md#no-plan-or-status).

## Progress in the repo, retro as a log

**Why.** `factory/progress.md` travels with the branches, so merging a job also merges its status, and any session can answer "what is left" from the repo alone. `factory/retro.md` collects what went wrong in every session without stopping the work; the items are analysed in batches, so fixes become lint rules or skill changes instead of one-off reactions.

## One ordered plan table

**Why.** Separate component, cdk and job tables could not show order or dependencies, so "what is next" depended on whoever read them. One table in build order, with scope, dependencies and a plain description of the behaviour per row, lets a reader without the project's history see the plan and lets `/factory next` pick the next row mechanically. The earlier tables stay below it as detail, so no job history is lost.

## The orchestrator keeps a rewritten state section, not only a log

**Rejected alternatives.**

- _An append-only log only._ After compaction the next model reads hundreds of lines to learn what is running and which worktree holds which branch.
- _Trust the handoff on resume._ A background task, branch or port may have changed since the last write.

**Why.** Compaction drops decisions, verbatim maintainer answers, running task ids, ports and codex session ids. A short state section that is rewritten each step holds exactly those; the dated log stays as history. The resuming model verifies each claim, because the file can lag the world.
