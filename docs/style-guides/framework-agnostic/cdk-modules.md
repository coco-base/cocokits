# CDK modules (`@cocokits/cdk/<module>`)

A cdk module is a reusable, framework-free behaviour building block. It is plain TypeScript, takes elements (or a scope that resolves them), returns a cleanup or an instance with `destroy()`, and does no styling. There is one subpath per module and no root.

Examples of what belongs in cdk (illustrative, not a list of required modules): roving focus, list keyboard navigation, typeahead, focus trap and focus scope, dismissal, portal container resolution, positioning, presence, scroll lock, live announcements, collections, and native form participation. Extend an existing module before adding one, and never create two modules for one responsibility. Add a module when a component needs it. Stateless helpers are utils, not cdk modules.

## Rules

- Import only utils, shared and sibling modules (through their `index.ts`), with no cycle between modules: the `cycles` target fails on one, `import type` included. A helper that two module folders need lives at the root of `packages/cdk/src` (for example `deep-active-element.ts`, `modal-dialog.ts`), not exported from any entry point, because the boundary rules forbid a deep import between module folders. External packages only where [layers-and-imports](./layers-and-imports.md) allows. Never import a machine or a framework.
- Split pure logic (key to intent, index resolution, rect math) from the stateful instance, so a machine can call the pure part.
- Take lazy callbacks (`getItems: () => readonly TItem[]`), called on every use and never cached. Callers find elements through registered refs or the part class.
- Prefer exposing `handleKeyDown(event): boolean` (consumed means `true` plus `preventDefault`) over owning listeners, so the caller decides where to attach. Skip events that are `defaultPrevented`, composing, or modified (unless listed).
- Report changes through callbacks with details (`onActiveChange(item, { reason, event })`, closed `reason` union).
- Follow [ssr-and-lifecycle](./ssr-and-lifecycle.md): lazy DOM access, nothing at import time, idempotent cleanups, ref-counted per-document state.
- No `use*` exports. Options are `readonly` with `x?: T | undefined`, documented with `@defaultValue`.

## Collections

Compound components register their items with a collection; adapters sort only with `sortByDomOrder` from `@cocokits/utils` (it sorts in rendered order, through shadow roots and slots) and cache nothing on their own.

- Order is DOM order, re-evaluated after items mount, unmount or move.
- Registration is live: an item registers getters (key, element, value, disabled), so a change after mount is seen on the next read.
- When the selected or focused item is removed or disabled, the tab stop falls back to the first enabled item.
- Duplicate values are a development error; the first registration wins.
- Server-rendered markup is complete before any registration: the tab stop is computed from props and state, never from the DOM.
- A composite widget has exactly one tab stop: the selected item while it is registered and enabled, otherwise the first enabled item. Selection never changes on its own.
- Disabled items are skipped by arrow keys but stay visible. The current index comes from the event target, not from stored state. Horizontal arrows flip in RTL; the direction comes from the adapter's direction runtime, never `document.dir`.

## Form participation

Form-capable components participate in native forms through a hidden native input ([architecture, section 6](../../architecture.md)). One cdk module owns it, so every framework gets native `input`/`change` events (for user changes only, never for prop sync), the `form` attribute, disabled fieldsets, reset and constraint validation. The hidden input is `aria-hidden`, not focusable, visually hidden and placed after the focusable part. When the hidden input exists per framework is stated in [architecture, section 6](../../architecture.md#6-props-events-and-forms-contract). It stays in sync with the controlled value (also when a parent rejects a change), resets to the default value on `form.reset()` and follows the owning form when it changes. When validation fails, focus moves to the visible control.

Rules for the hidden input in every framework (the framework forms guides add only what is specific to them: [react](../react/forms.md), [vue](../vue/forms.md), [angular](../angular/forms.md)):

- It has the matching native `type` and carries `name`, `value` (or `checked`), `form`, `required` and `disabled` from the component's state. It is hidden with the shared visually-hidden style, never `display: none` (which skips constraint validation).
- It is a sibling after the focusable part, never a child (axe `nested-interactive`).
- The visible control activates the input natively (`input.click()`, skipped when disabled or read-only), so real `input` and `change` events, `FormData` and constraint validation follow. State changes in the input's change handler, not in the control's click handler. The input stops click propagation so ancestors see one click.
- On an invalid submit the browser focuses the input; its focus handler forwards focus to the visible control.
- `form.reset()` restores the default value with reason `'form-reset'`; a consumer `reset` listener that calls `preventDefault()` cancels it. A disabled ancestor `<fieldset>` makes the control render `data-disabled` and stop reacting.
- `invalid` is a prop rendered as `aria-invalid` and `data-invalid`; `required` also renders `aria-required` and `data-required`. `readOnly` rejects changes but stays focusable and announced (`aria-readonly`, `data-readonly`). Base parts show no validation UI.
- Expose the input ref so consumers can reach the native input.

### Native control

A component whose control is a native `input` (text, checkbox or radio) or `textarea` has no hidden input; the module's `createFormParticipation` serves the element itself. It listens on the document (capture; the group `change` listener: see the group report below) and reads the owner form from `element.form` when an event happens, so a changed `form` attribute needs no re-setup.

- A reset is reported once, in a later task, after the browser has reset the element and every listener has run. A canceled reset reports nothing. A submit is reported even when a listener cancels it, because forms libraries do; the `invalid` event is never a source.
- A disabling ancestor fieldset is reported once after creation and again whenever a change of a fieldset's `disabled` flips the answer, from one ref-counted observer per document.
- Controls with a field state follow the `aria-invalid` exception in [aria-rules](../accessibility/aria-rules.md#disabled-read-only-invalid-required).
- Checked mode (`getChecked` instead of `getValue`) is for a checkbox or radio: `syncValue()` writes `.checked`, and a reset is reported and synced the same way.
- Group report (checked mode, `onUncheckedByGroup`): when the user checks another radio with the same non-empty `name`, form owner and root node, the unchecked radio gets that `change` event. The `change` listener sits on the radio's root node (the document or its shadow root), not the document, because `change` is not composed. A parent-only change is not reported, because the browser fires no event for it.
- The module writes the model value to the element after a reset; the caller decides what the model becomes (with a forms library it does not change it).

## Focus

- Components do not implement focus logic ad hoc; they compose cdk modules.
- Use roving tabindex or `aria-activedescendant` as the WAI-ARIA pattern for the component requires.
- Never steal focus on mount, except when an overlay that takes focus opens or when explicitly requested.
- Expose focus visibility through a focus-visible modality tracker, not only `:focus`.
