# Lead workflow

## Establish the feature record

Check the current branch, HEAD, and `git status --short`; record pre-existing dirty
paths before assigning work. First look for a matching
`ai-work/components/<slug>/` record. Resume and reconcile it when present; never
overwrite an existing brief, progress log, or validation record. If several records
could match and the intended component is unclear, ask the user. For new work,
create `brief.md`, `progress.md`, and `validation.md` from the skill templates.
Record the design links or local references, requested behavior,
framework/theme scope, accessibility and interaction states, open questions, and
explicit exclusions. Put durable screenshots in that task directory (for example
`references/` and `validation-screenshots/`) when licensing and size permit; record
external reference URLs and exact inspected frames otherwise.

On restart, read these files, then reconcile every claimed result with the current
branch, HEAD, relevant working diff, source files, and test output. A check or
screenshot becomes stale after a relevant implementation change. Verify whether
recorded workers are still live before replacing them so an older worker cannot
write concurrently. Mark stale or superseded entries; do not erase useful history.
Record status (`in progress`, `blocked`, or `complete`), who owns each active task,
and the next concrete step so a fresh lead can continue without scanning the whole
repository. Update the handoff record before pausing, compaction, or ending a turn,
not only after worker responses.

## Inspect and plan without product edits

Read `ai-instructions/codex/architecture.md`, `components.md`, `themes.md`,
`storybook.md`, and `workflow.md`. Inspect the target's closest analogues, public
exports, resolved Nx targets, both theme configs and SCSS, both story structures,
shared selectors, and relevant generators. Search specifically for reusable
components, CDK primitives, utilities, hooks, stores, types, tokens, styles,
examples, and assets. Record named source precedents and reuse decisions in the
brief. A worker proposing a new helper must show why an existing resource does not
fit. Extracting shared code across an existing package/framework boundary is an
architectural decision and requires user approval.

Define acceptance criteria before dispatch: public API, DOM/selector contract,
keyboard/focus/accessibility behavior, framework integration, theme props and
states, docs/source examples, tests, build targets, and screenshot comparisons.
If no existing precedent resolves a choice that changes shared contracts,
dependencies, DOM architecture, public API shape, or token architecture, pause the
dependent implementation and ask the user with concrete choices and evidence. Also
ask when a consequential requirement, design interpretation, API choice, or access
to the supplied reference cannot be resolved. Continue independent work while the
dependent scope waits. Never make a new architectural choice without user approval.

## Delegate implementation

Use only these exact worker model mappings:

- `gpt-5.6-sol`: complex shared contracts, interactive behavior, architecture-heavy
  integration, or difficult cross-framework work.
- `gpt-5.6-terra`: standard bounded framework, theme, or Storybook implementation.
- `gpt-5.6-luna`: easy, tightly bounded mechanical work with a clear precedent.

When overriding a worker model, spawn it with `fork_turns: "none"` or a positive
numeric value. Do not silently substitute another model if the selected model is
unavailable. Record the blocker and ask the user whether to wait or authorize a
named suitable alternative from the other two allowed models; do not dispatch the
affected task before the answer, but continue independent work. Give each worker a bounded file
scope, acceptance criteria, relevant design facts, required guides, and a reminder
that it is a worker that must implement directly and report files/checks. Tell it
to preserve unrelated changes and not commit or push.

Parallelize only independent, disjoint work. Serialize changes to shared selector
contracts, generators, barrels, theme registries, shared examples, generated
outputs, and any files with overlapping ownership. Prefer one worker to establish
the shared contract before framework/theme workers consume it. Workers must search
for and reuse existing resources and follow the closest repository precedent.

The lead answers worker questions from verified repository evidence. Escalate the
unresolved consequential questions described above to the user. Update
`progress.md` after each handoff with actual file state and validation evidence,
not just the worker report.

## Independently verify and repair

Review the integrated diff for architectural consistency, duplication, framework
boundaries, selector/DOM compatibility, exports, generated-source provenance,
accessibility, cleanup, public docs, and release notes. The lead may add or refine
focused tests that expose acceptance failures, then run the smallest relevant
checks from `ai-instructions/codex/workflow.md`. Record test counts and failures;
a passing target with no tests is not coverage.

Start both Storybooks and inspect the component in a real browser. Exercise every
relevant Angular/React x Frames X/CocoKits combination and meaningful states such
as default, hover, focus-visible, active, disabled, invalid, loading, selected,
open/closed, light/dark, keyboard navigation, and responsive layout as applicable.
Capture durable screenshots and compare geometry, spacing, typography, color,
icons, and state behavior against the supplied Figma/resource at matching viewport
and mode. Check console errors and displayed source examples.

Normal validation targets may invoke generation dependencies and update tracked
derived files. The lead may run those targets, but must inspect and record resulting
changes, never hand-fix product output, and route any required correction to a
worker. Deliberate scaffolding and product generation remain worker implementation.

Do not claim visual success when the reference cannot be accessed, the relevant
state is absent, Storybook cannot run, screenshots were not compared, tests are
missing for important behavior, or checks fail. Record the limitation precisely.
Convert each defect into a bounded worker assignment, select its model by
complexity, and repeat review, tests, and browser comparison until acceptance is
met or a real blocker requires the user.

## Improve instructions from evidence

When a worker or lead failure reveals a repeatable gap, make the smallest durable
correction in this skill or the appropriate `ai-instructions/codex/` guide. Record
the observed failure, evidence, changed instruction, and expected prevention in
`progress.md`. Do not generalize from a one-off mistake, change product scope or
permissions, make architectural decisions, or weaken validation. Validate skill
changes with the skill-creator `quick_validate.py` script and format changed
Markdown.

Completion requires a reconciled task record, a reviewed diff, and all required
checks and browser comparisons recorded in `validation.md`. Mark the task complete
only when every required acceptance criterion is met. Mark it in progress when
work can continue, or blocked when a required decision/access dependency prevents
progress; unresolved required criteria cannot be reported as complete. A component
task does not imply permission to commit or push.
