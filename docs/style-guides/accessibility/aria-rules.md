# ARIA, ids, labels and platform rules

What the base renders so that assistive technology reads the right name, role, state and relationships. Widgets named here are examples of a rule; a component's actual ARIA contract comes from its requirements ([architecture.md](../../architecture.md)).

## Semantics first

- Use the native element where one exists: `<button>` for triggers, `<input>` for text and hidden form inputs, `<label for>`, `<dialog>` for modals. Div-plus-ARIA breaks voice control, forced colors and mobile screen readers.
- Button parts set `type="button"`.

## Roles and states come from the base only

- The base (machine props or the framework part) emits `role`, `aria-*` and `data-*`. Themes never add ARIA. The anatomy carries no role or attributes.
- Boolean ARIA: emit the attribute when true and omit it when false, except where ARIA requires an explicit `"false"` (for example `aria-selected`, `aria-expanded`, `aria-checked`, `aria-pressed`).
- Decorative parts (indicators, icons) get `aria-hidden="true"`.
- A hidden native form input: [cdk-modules](../framework-agnostic/cdk-modules.md#form-participation).

## Ids and relationships

- Ids: [machines](../framework-agnostic/machines.md#ids).
- Every IDREF (`aria-controls`, `aria-labelledby`, `aria-describedby`, `aria-activedescendant`) resolves in server HTML too. Keep inactive panels mounted with `hidden` where another element points at them.
- Closed overlays render nothing, so a trigger renders `aria-controls` only while the content exists; `aria-expanded` and `aria-haspopup` are always rendered. Never copy ids or labels into portaled content ([focus-and-overlays](./focus-and-overlays.md)).
- A consumer-supplied `id` or `aria-*` wins and the linkage follows it. `aria-describedby` / `aria-labelledby` lists are merged, never overwritten.

## Labels and descriptions

- Every interactive part has an accessible name. Prefer `<label for>` or a visible label wired with `aria-labelledby`.
- Composite containers (a tab list, a toolbar, a menu) need a name.
- Descriptions, errors, `aria-invalid` and `aria-required` are wired by the base.
- Tooltips describe (`aria-describedby`); they never label.

## Disabled, read-only, invalid, required

Disabled behaviour differs per APG pattern; follow the pattern and state the choice in the component's requirements.

| Case | Guidance |
|---|---|
| Native control disabled | `disabled` plus `data-disabled`; not focusable |
| Items of a composite (menu items, tabs, options, radios, disclosure headers) | Follow the pattern: some stay focusable but never activate (for example menu items), others are skipped by arrow keys (for example options), some stay in the Tab order (disclosure headers). Use `aria-disabled="true"` plus `data-disabled` where the element stays focusable |
| Read-only | `readonly` / `aria-readonly` plus `data-readonly`; focusable, value keys do nothing |
| Invalid | `aria-invalid="true"` plus `data-invalid`. Exception, controls with a field state (a native text or choice control that tracks touched and submitted, such as the Input and the Checkbox) ([why](../../why/forms.md#aria-invalid-is-gated-data-invalid-is-raw)): `data-invalid` follows `invalid` alone, and `aria-invalid="true"` appears only while invalid and (touched or submitted), never `"false"` |
| Required | `required` / `aria-required` plus `data-required` |

A disabled item is never activatable by keyboard, click or tap, whatever its focusability. A disabled fieldset disables contained controls. When the current tab stop becomes disabled or is removed, the tab stop falls back to the first enabled item.

## Live regions and announcements

- Semantic live-region components keep their role: an alert renders `role="alert"`, a status renders `role="status"`, pre-rendered so the region exists before its text changes. Do not use these roles elsewhere.
- Transient announcements (toast text, result counts, "copied") go through one pre-mounted live region per document; a component does not inject an ad-hoc `aria-live` element at the moment it needs to speak.
- A FieldError is the one pre-rendered `aria-live="polite"` region with no role: it is always in the DOM and only its content is inserted while `invalidShown` holds for its field (or with `force`, or outside a field), so it never injects the live element at the moment it speaks. Why: [forms](../../why/forms.md#a-fielderror-is-a-pre-rendered-polite-region).
- Announcements never steal focus.

## Strings, RTL, touch

- User-visible strings the library renders (Close, Clear, "{n} selected") are overridable, with locale defaults.
- `dir` is a prop or context, never read from `document` during render. RTL arrow keys: [keyboard](./keyboard.md). floating placement uses logical sides.
- Target size: [themes](../themes/css-conventions.md#focus-and-target-size). Dragging has a keyboard or single-pointer alternative. Use passive touch and wheel listeners unless `preventDefault()` is required.

## Lint

Typed ESLint runs on every project (`pnpm nx run <project>:lint`, [targets.md](../workspace/targets.md)). Prefer the accessibility rules of the framework's template or JSX lint tooling when it is configured; do not claim a lint check that is not configured.

## Example

```tsx
// Incorrect: "false" via data attr, id from the display value, unlinked panel
<button role="tab" data-disabled={disabled} id={`tab-${label}`}>A</button>
<div>{active && panel}</div>

// Correct: stable ids, linked, mounted and hidden when inactive
<button role="tab" type="button" id={triggerId} aria-selected={selected ? 'true' : 'false'}
  aria-controls={panelId} aria-disabled={disabled ? 'true' : undefined}
  data-disabled={disabled ? '' : undefined} tabIndex={isTabStop ? 0 : -1}>A</button>
<div role="tabpanel" id={panelId} aria-labelledby={triggerId} hidden={!selected}>{panel}</div>
```
