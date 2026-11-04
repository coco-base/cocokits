# Scenarios

Purpose: how a scenario is written, what the story compiler does with it, and how it runs. When a story needs one: [When a story needs a scenario](./stories-and-scenarios.md#when-a-story-needs-a-scenario). Why: [tooling](../../why/tooling.md#scenarios-run-as-end-to-end-tests).

A scenario is a story plus ordered steps, written once as plain data (`@cocokits/shared`). The story compiler checks it against its story and writes it as JSON beside the story's metadata. It runs as an end-to-end test of the docs site (`pnpm nx run docs-e2e:e2e`, [targets.md](../workspace/targets.md)): one Playwright actor opens the story's block, selects each framework in turn and performs the steps with real input inside the preview frame; `expectEvent` reads the Events panel. That run is the record for the scenario: the story behaves the same in Angular, React and Vue. It is not the component's test: the component's own keyboard, form and rendering contract stays tested in its package ([component tests](../testing/component-tests.md)), and a scenario never replaces a component test. The in-page replay (`runScenario`) is a later job and is approximate when it comes.

## Definition

The file is `packages/docs-stories/src/<component>/<id>.scenario.ts` (or in a theme folder, for that theme only). It is read with TypeScript syntax and never run, like a story: one `export default defineScenario({ … })` whose steps are calls of the step functions with literal arguments.

```ts
// packages/docs-stories/src/radio/plan.scenario.ts
import { defineScenario, expectChecked, expectFocus, expectText, focus, press, role } from '@cocokits/shared';

export default defineScenario({
  component: 'radio',
  id: 'plan',
  storyId: 'plan',
  title: 'The arrow keys move the check, and the state follows',
  steps: [
    focus(role('radio', { name: 'Basic' })),
    press('ArrowDown'),
    expectFocus(role('radio', { name: 'Pro' })),
    expectChecked(role('radio', { name: 'Pro' }), true),
    expectChecked(role('radio', { name: 'Basic' }), false),
    expectText(role('paragraph'), 'Selected plan: Pro'),
  ],
});
```

`component` is the folder name, `id` is the file name without `.scenario.ts` and `storyId` is the id of a story of that component. The steps are typed in `@cocokits/shared` (TSDoc on each); this is the whole set:

| Kind | Steps |
|---|---|
| Targets | `part('<partName>', i)` (the i-th element with the part class `cck-<partName>` in the whole preview document in document order, a portaled part included, `-1` is the last); `role('<role>', { name })` (an ARIA role searched in the preview document, with the exact accessible name when it matters); `within(container, target)` (the target is searched inside the element the container names, as Testing Library's `within(element)` binds its queries; it nests, takes `role` and `part` targets, and `part(name, i)` counts inside the container, so a step reaches the Close of the inner one of two dialogs) |
| Actions | `click(t)`, `hover(t)` (a real pointer move to the centre of the target), `clickOutside()` (a real press and release 4px inside the top-left corner of the frame, a point no story stage covers), `focus(t)`, `type(t, text)` (real key presses), `press('Key')` and chords such as `press('Shift+Tab')` |
| Expectations | `expectText(t, text)` (the whole text), `expectAttr(t, attrName, value)`, `expectValue(t, text)`, `expectChecked(t, true \| false \| 'mixed')`, `expectFocus(t)`, `expectAbsent(t)` (no match, or every match hidden; it retries, so an overlay that unmounts a moment later is not a flake), `expectInert(t)` (the element cannot be used: a press at its centre does not reach it and a script focus on it does not move the focus to it; it retries, finds the element where the accessibility tree hides it, and holds for the page behind a native modal and for an `inert` subtree) and `expectEvent(eventName, { value, reason })` |

- `expectEvent` checks the newest row of the Events panel; a field it leaves out is not checked. The scenario runs in the three frameworks, and Vue's `update:*` event carries the value only, so its row has an empty reason: a scenario that expects the `reason` of a model change fails in Vue, so leave `reason` out for those events. The panel shows an empty text as `""`, and `value: ''` matches it. The story must report that event: `expectEvent('valueChange')` in a story with no Input is an error.
- Select by role and accessible name, or by part. Do not select by `[data-testid]` or `[data-part]`, and do not assert internal state.
- Overlay content is outside the story root (it is portaled), so a target resolves in the whole preview document. A step that reads the layer stack does not exist: read it through what the user sees (`expectAbsent`, `expectFocus`, `expectAttr`), and use `within` to reach a part of one layer and `expectInert` for the page behind a modal.
- `expectEvent('openChange', { value, reason })` works for an overlay story: the Events panel shows the `open` change and its reason (the component lists them, for example `'trigger'` or `'escape'`).

```ts
// Incorrect: test-id selector
expectFocus('[data-testid="tab-2"]');

// Correct: a role with its accessible name, or a part
expectFocus(role('tab', { name: 'Settings' }));
expectFocus(part('trigger', 1));
```

## What the stories target does

For each framework, the `stories` target ([targets.md](../workspace/targets.md#docs-targets)) checks every scenario against the compiled stories and writes `<theme>/<component>/<id>.scenario.json` beside the story's `<id>.json`, with the same writer: a scenario JSON it wrote is deleted when its source goes, and a file it did not write is never overwritten. The JSON is the same in the three frameworks. A scenario in the component folder is written for every theme that has its story. The errors:

| Code | When |
|---|---|
| `unknown-story` | The story does not exist in any theme (or not in the theme of the scenario's folder) |
| `missing-convention` | `component` is not the folder name, or `id` is not the file name |
| `invalid-value` | An `expectEvent` names an event the story does not report |
| `name-collision` | Two scenarios of one component share an id in one theme |
| `unsupported-syntax` | Anything that is not a literal call of a step: a variable, a spread, a step that does not exist, a wrong number of arguments, an import other than `@cocokits/shared` |

## How it runs

`apps/docs-e2e/tests/scenarios.spec.ts` reads the scenario JSON of one preview app's generated folder synchronously when it loads (the project imports no repo source) and registers one Playwright `test` per scenario and framework, for the `cocokits` theme (the target writes the JSON of every theme that has the story). The actor (`tests/support/scenario.ts`):

- opens the component page with the framework and theme in the URL, waits until the story's stage is no longer `aria-busy`, and takes the preview frame of the story's block;
- resolves `part` as `.cck-<partName>` by index and `role` with `exact: true`, both in the whole document of the frame (the content of an overlay is portaled out of the story root), and `within` inside the element of its container; `expectInert` also finds elements that the accessibility tree hides (the page behind a modal) and asks the browser where a press at the centre would land (`elementFromPoint`) and whether a script focus moves the focus, then puts the focus back;
- opens the Events panel when a step reads it, and reads its rows outside the frame;
- uses only retrying assertions (`toHaveValue`, `toBeChecked({ indeterminate })`, `toHaveText`), so a framework that renders a moment later is not a flake;
- fails with the scenario, the framework and the index of the step, and fails on any console error or warning.

The in-page player (`<Scenario />`, `runScenario`) will read the same JSON; until then the protocol answers `error { code: 'unknown-story' }` ([preview protocol](./preview-protocol.md)).
