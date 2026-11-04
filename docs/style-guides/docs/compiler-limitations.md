# Compiler limitations

What the story compiler (`tools/story-compiler`) cannot express, per framework. The language and the diagnostics are in [Story language](./story-language.md); the portability rules are in [Interaction portability](./interaction-portability.md). This file lists only what has no solution today: each entry says what the compiler does, the workaround and where it was found.

Adding an entry is the last step, not the first: the rule is in [documenting-components, Limitations](../../../.claude/skills/documenting-components/SKILL.md#limitations-of-the-compiler). An unclear case goes to [TODO](#todo), one line, with no research.

Columns: Id, what is not supported, what the compiler does, the workaround, where it was found. PR numbers are in `coco-base/cocokits-next`.

## Shared (all frameworks)

| Id | Not supported | Compiler | Workaround | Found |
|---|---|---|---|---|
| S2 | An expression on `size` of an `input` or a `select` | `invalid-value`: React drops a size below 1, Vue's DOM property refuses 0 on an `input` | A literal `size` | PR #55 |
| S3 | An expression on the attributes the [Expression attribute](./story-language.md#state-and-handlers) row refuses (`value`, `checked`, a URL attribute) | `invalid-value` | A literal; `bind` for the value of an input | PR #55 |
| S4 | An imperative call: the language has no statement that calls something, so Angular `CckDialog.open` has no story | `unsupported-syntax`; no story exists for the service | Stories use the declarative Dialog (the `open` model, `bind={open}`); the Dialog page shows the type-checked sample `apps/preview-angular/src/samples/dialog-service.ts` as "Opened from code" ([site-architecture](./site-architecture.md#docs-app-components)) and describes the service in prose | PR #87 |
| S6 | Operators and forms the [Expression](./story-language.md#state-and-handlers) row does not list, and markup inside an operator | `unsupported-syntax` | `when(condition, …)` for markup; a `derived` for a value | PR #83 |
| S7 | `===` or `!==` on an arg ([Expression](./story-language.md#state-and-handlers) row), and a comparison or a choice of text the compiler cannot match to a union prop, a theme option or a catalog type ([Catalog types](./story-language.md#catalog-types)) | `invalid-value`: the compiler cannot match the values to the type, and TypeScript refuses the printed code | Compare a state; write the choice in the comparison; type the state by its catalog type | PR #83, PR #55 |
| S8 | An array, object or tuple literal as a prop value ([Arrays](./story-language.md#story-language) row), and `children: true` in a `sample` | `unsupported-syntax` | A constant `const` list read by `each`, a list state ([List state](./story-language.md#list-state)), or the `default<Model>` of a list model | PR #35, PR #49 |
| S9 | A handler on an element outside the interaction domain ([Interaction portability](./interaction-portability.md)) | `event-attribute`, message starts "out of domain" | The Radio, Input or Textarea components, which have delivery contracts; the table is in [Interaction portability](./interaction-portability.md) | PR #53, PR #54, PR #84 |
| S10 | Two handlers of one interaction that share a state; a handler that removes or hides an element with an `onBlur` or a later step (rules R and B) | `invalid-handler`; the rules refuse more than they have to | The rewrite list in [Interaction portability](./interaction-portability.md) | PR #53, PR #54 |
| S11 | An action on every key press (`onInput` beside `bind`); `onChange` or `onClick` on a text input; `onInput` on a select | `event-attribute` | Show a `derived` value or a `when` over the bound state | PR #53 |
| S12 | `class` or `style` outside the `class` row, and styling beyond layout ([Story styles](./story-language.md#story-styles)) | `styling-attribute` | Layout-only `styles` and `class` on native elements | PR #86 |
| S14 | Scoped slot content outside [Scoped slots](./story-language.md#scoped-slots) | `slot-content-mismatch` | Use the fields as text, `.length`, `when` or `each` | PR #86 |
| S15 | A `render` value outside [Part composition](./story-language.md#part-composition) | `unsupported-host` or `unsupported-syntax` | One component element with literal attributes; the content is the children of the part | PR #86 |
| S16 | The real type of a generic component ([List models](./story-language.md#list-models)) | Stories and controls treat the Select as string-valued; function props (`itemToStringLabel`, `isItemEqualToValue`) and `items` are of kind `other`; the type of `multiple` reads `boolean` | None | PR #87 |
| S18 | A `form()` control beside the attributes its field owns ([Args](./story-language.md#args), the `control` row) | `invalid-value`: Angular refuses them next to `[formField]` (NG8022) and the frameworks must agree | Let the form own them | PR #84 |
| S19 | In a custom story with args, the uses [Args](./story-language.md#args) refuses | Error with a hint | Read the arg in a `derived`; list the values in `argValues` | PR #55 |
| S20 | Portability evidence beyond Chromium (pinned) with settled interactions: The scenarios of the Dialog, Popover, Tooltip and Select also run in Firefox and WebKit (`docs-e2e:e2e:overlays`); every other scenario, `browser-facts` (apart from its dismissal rows) and the rest of `docs-e2e` stay Chromium-only, and rapid input before an interaction settles is not guaranteed; `browser-facts` and `docs-e2e` are not in CI | No diagnostic; the guarantee is narrower than it reads | Run `browser-facts` locally before merging a change under `tools/story-compiler` | PR #53, PR #54, PR #55 |
| S21 | A catalog union alias nested inside another type, and a theme option whose values differ per theme ([Catalog types](./story-language.md#catalog-types)) | No control; `invalid-value` | Use the alias as a whole union member | PR #35, PR #52 |
| S22 | A router link and the current route in a story (the TabNav): the language has no router, no link that follows one and no way to read the route | `unknown-attribute`: a router attribute is not in the vocabulary | A story keeps same-page addresses (`href="#overview"`) and sets `active` itself. In an app, see the routing guide, `apps/docs/src/guides/routing.mdx` (page `/guides/routing/`): fenced samples for Angular Router, Next.js and Vue Router. The TabNav overview links it | PR #87 |
| S23 | `details.reason` (or any member of the parameter) in a change handler: Radix `onOpenChange(open)` and Reka `update:open` carry no reason, so the three frameworks cannot agree on it | `invalid-handler`: a handler of a component event takes the value only | Read the reason in the Events panel; to keep an overlay open, use `refuseWhile` ([story-language](./story-language.md#the-open-model-and-part-events)) | PR #87 |
| S24 | A part or a prop one framework does not have: the Tooltip `Provider` (React and Vue), and the React and Vue positioning props of the Tooltip content | The Provider is a `frameworkOnly` part, so the compiler skips it instead of failing the Angular check; a story that writes it, or one of the props, fails in Angular with `unknown-attribute` or `part-placement`, and no story or control exists for them | The TSDoc and the Tooltip overview describe the Provider and the props; the groups and delays of a Provider are shown in prose | PR #87 |
| S25 | A story of a tooltip on a disabled button (a focusable wrapper around a button with `pointer-events: none`) | `invalid-style`: `pointer-events` is not a layout property, and a descendant selector (`.wrapper > button`) is not a story rule; `styling-attribute`: `class` on `Tooltip.Trigger` | The pattern is in the Tooltip overview and the TSDoc of the trigger; no story or scenario shows it; the computed description of a text tooltip is checked in `tooltip.spec.ts` | PR #87 |
| S26 | The custom trigger of the Select: React `Select.Value` children as a function of the value, Vue `SelectValue` default slot with `selectedLabel` and `modelValue`, Angular `ng-template[cckSelectTrigger]` with `selected`. The three have no common scope in the `ApiDoc` (a function child is not a prop and the scope field names differ), so the language has no scoped slot for it | `unsupported-syntax`: "a function is not supported in the story language"; no story shows it | The API tables and the page prose describe it | PR #87 |
| S27 | A Select item with the value `null` (`value={null}`), and `items` or `itemToStringLabel` on the Select root: the language has no `null`, object or function literal | `unsupported-syntax`; the empty option story uses the empty text (`value=""`), which clears too | Label data and object values stay out (S16) | PR #87 |
| S28 | The order of the chosen values of a `multiple` Select: Angular lists them in the order of the options, React and Vue in the order of the choices | No diagnostic; the three views of a story that prints the list in a fixed order differ after the user chooses against the option order | Show the count (`dishes.length`) or let the story not depend on the order; the components document it | PR #87 |
| S29 | An Accordion item that a root `defaultValue` names and that sits in a `when`: Angular keeps the open state on each item (`expanded`), React and Vue on the root, so whether the item opens again when the condition turns true is not the same in the three frameworks | No diagnostic; the three views of a story may differ after the item comes back | Keep the item outside the `when`, or control the open value with `bind` | PR #87 |

## Angular

| Id | Not supported | Compiler | Workaround | Found |
|---|---|---|---|---|
| A1 | A white space other than the ASCII ones and U+00A0, in text or as an entity | Error: Angular drops or merges it in a template | Write a space or `&nbsp;` | `jsx-text.ts` (`unsupportedSpace`); PR #49 |
| A2 | A native attribute, `as` or `render` on a part that an Angular directive renders itself (the `renders` of its `ApiDoc`, such as the Tabs list); a part that is not a direct child of its renderer | `unsupported-host` | Give the attribute to the input the renderer has (`aria-label` on `cckTabs`) | PR #86 |
| A3 | A native attribute or `as` on a root that renders no element (`<ng-container cckPopover>`) | `unsupported-host` | Put the attribute on a part | PR #86 |
| A4 | Zoneless view updates after the handlers of a trace, and a blur that the story's own update causes | Rules R and B refuse the shapes that differ (S10) | Hide a wrapper or disable the element instead of removing it | PR #54 |
| A5 | Nothing shows the Angular view update in a snippet except extra code | Angular snippets print methods such as `change_1()` with `this.cdr.detectChanges()` (degrades the snippet) | None | PR #53 |
| A6 | On the Accordion: root `disabled`, `orientation`, `dir`, `unmountOnHide`, content `forceMount`, and any attribute on the header, trigger or content | `unsupported-host`, naming the member and the reason; a generated story or control for one asks for `hideControls` and `skip` | `disabled` on each item; skip the story and document the member in the API tables | PR #87 |
| A7 | `bind` and `onValueChange` on the Accordion root | `invalid-bind` and `event-attribute` (Angular has no root value; React and Vue refuse the list model too) | None; the page shows the events of the item in prose | PR #87 |
| A8 | An Accordion item with a `value` that is not a string literal next to a root `defaultValue` | `compound-mismatch`: Angular opens items with `[expanded]`, which needs the literal key | Write the keys as literals | PR #87 |
| A9 | `open`, `bind={open}` and `onOpenChange` on the Tooltip root, and a scenario that waits for its `openChange` event | `unsupported-host` for the attribute; `invalid-value` for the scenario step ("story does not report openChange"): the Angular Tooltip has no open model and no output | `defaultOpen` (opens with `show(0)`); a scenario asserts the content (`expectAttr`, `expectAbsent`) | PR #87 |
| A10 | On the Tabs: reading the state that follows the root (`{tab}`, a `derived`, a `when`), setting it to anything but the literal `value` of a tab, and a handler of `onValueChange` that reads the value | `invalid-bind` and `invalid-handler`: Angular selects by index, so the state holds the index and the change reports it | Show the selected tab with its panel; count the changes in the handler | PR #87 |
| A11 | `forceMount` on some panels of the Tabs only, and a Tabs `value` that is neither a text nor the item of an `each` over a list | `compound-mismatch`: Angular keeps the content of all panels with `preserveContent`, and finds a tab by its position | Mark every panel or none; write the values as texts | PR #87 |
| A12 | `bind`, a change handler and a `defaultValue` that names a tab after a tab in a `when`, on a Tabs root with such a tab: Angular selects by position and keeps the selected tab without an event when a tab before it comes or goes | `compound-mismatch` with that reason | Start with a tab that no `when` tab precedes; show the selected tab with its panel | PR #87 |

## React

| Id | Not supported | Compiler | Workaround | Found |
|---|---|---|---|---|
| R1 | `onChange` on a text input (React fires it on every key, the native event does not) | `event-attribute` | `onInput`, or `bind` | PR #53 |
| R2 | `autofocus`: React calls `focus()` on every mount, the browser declines once another element has focus | `event-attribute` on any element | Remove it | Story compiler review |
| R3 | A focus handler on a button that holds a `<summary>`: React runs it, the others do not | `invalid-handler` | Keep the handler off the button | Story compiler review |

## Vue

| Id | Not supported | Compiler | Workaround | Found |
|---|---|---|---|---|
| V1 | The names `onVnodeBeforeMount`, `onVnodeMounted`, `onVnodeBeforeUpdate`, `onVnodeUpdated`, `onVnodeBeforeUnmount` and `onVnodeUnmounted` as an arg, state or attribute: Vue reads them as vnode hooks | `name-collision` | Another name | PR #55 |
| V2 | `size` at 0 on an `input`: the DOM property refuses it (see S2) | `invalid-value` for an expression | A literal of 1 or more | PR #55 |
| V3 | Native attribute checks for Vue consumers of the Button: the consumer fixture runs `vue-tsc` with `checkUnknownProps: false` | `type`, `aria-label` and attribute typos are not type-checked in Vue | None | PR #18 |


## TODO

One line each, not researched. Find out later.

- An expression on `ol start`: Vue sets the DOM property (values from 2^31 wrap, fractions truncate). Refuse it like `size`, or print `.attr`?
- A literal `size` is not range-checked: `size={0}` prints differently and renders the same. Require a whole number from 1?
- Bare `state('…')` for a union prop and number-literal attribute values: which cases are refused and why is unclear.
- WebKit is not verified for the overlay top-layer host in a modal dialog (PR #85, Risk).
- Pointer traces span two tasks (focus and click) but the rule treats them as one. Which stories does it refuse that it need not?
- `Enter` submits a form and `reset` restores fields: refused today. Is a portable rule possible?
- Textarea editing, number binding and native radio groups are out of the domain: which need a delivery contract of their own?
- Rule R refuses a dismissal that shares its chain with a later handler even when that handler would behave. Can the rule be narrowed?
- Angular `@if` condition escaping would garble a future string literal or `&&` in a condition; today a condition is a name or `true`/`false` (PR #51, security note).
- No `browser-facts` row for the operators, and the `operators-strings` scenario has no golden, so a printer change could alter its escapes unseen (PR #83).
- The `preview-*:stories` targets do not list the tsconfigs in their inputs; a changed `lib` or `types` could replay a cached `stories` result (PR #52).
- `consumer-fixture:check` is not verified on Linux and is not in CI (PR #18).
- A BadgeContainer theme-option story would print the whole sample per value (PR #34).
- `as` on an attribute-only component has Angular goldens only; React and Vue are thinly covered (PR #32).
