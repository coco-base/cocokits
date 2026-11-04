# Keyboard, focus, RTL and diagnostics

Angular-specific accessibility mechanics. The patterns, ARIA rules and manual checks are in [accessibility](../accessibility/index.md); the invariants are in [architecture](../../architecture.md).

## Rules

- Follow the WAI-ARIA APG keyboard behaviour for the pattern, prefer native semantics (`button`, `disabled`, `<label for>`), and keep exactly one tab stop per composite widget (roving `tabindex` or `aria-activedescendant`).
- Horizontal keyboard handling swaps Left/Right when `inject(CckDirection).dir()` is `'rtl'`; vertical orientation uses Up/Down.
- Do not remove focus outlines in base CSS. Render `data-focus-visible` where the component's contract declares it (set on `focus` from `element.matches(':focus-visible')`, cleared on `blur`).
- Activation on a native `<button>` comes from `click` (pointer, Space and Enter alike). A consumer vetoes a change with `event.preventDefault()` in its own handler: check `event.defaultPrevented` before acting and never call `preventDefault` on that event yourself. Read-only parts reject the change but stay focusable.
- Focus targets come from registered element refs or the root's own `viewChildren`, never from attribute queries.
- User-visible strings (such as "Close") come from an `InjectionToken` with English defaults, never hard-coded.

## Roving focus

For simple 1-D roving, write a small handler that reacts to `orientation` / `dir` changes. Start from `event.target` (the item that really has focus), never from a stored active item.

```ts
// Example (illustrative)
protected moveFocus(event: KeyboardEvent): void {
  const horizontal = this.orientation() === 'horizontal';
  const rtl = this.dir() === 'rtl';
  const nextKey = horizontal ? (rtl ? 'ArrowLeft' : 'ArrowRight') : 'ArrowDown';
  const prevKey = horizontal ? (rtl ? 'ArrowRight' : 'ArrowLeft') : 'ArrowUp';
  const items = this.orderedItems().filter((i) => !i.disabled());
  const current = items.findIndex((i) => i.element === event.target);
  if (current === -1) return;
  let next: number;
  switch (event.key) {
    case nextKey: next = current + 1; break;
    case prevKey: next = current - 1; break;
    case 'Home': next = 0; break;
    case 'End': next = items.length - 1; break;
    default: return;
  }
  next = (next + items.length) % items.length;
  event.preventDefault();
  items[next].element.focus();
}
```

## Key managers

For lists with typeahead use `FocusKeyManager` / `ActiveDescendantKeyManager` from `@angular/cdk/a11y` with `skipPredicate((i) => i.disabled())`: the default check reads `item.disabled` as a property, and a signal function is always truthy. Destroy the manager from `DestroyRef`. Behaviour shared across frameworks lives in `@cocokits/cdk` ([framework-agnostic](../framework-agnostic/index.md)).

## Modal focus

A modal overlay uses the native `<dialog>`, which makes the rest of the page inert, so there is no focus trap. Capture the focus and restore it on close with `captureFocusReturn` from `@cocokits/cdk/focus`, unless the user moved focus. Non-modal focus rules: [overlays](./overlays.md).

## Dev-mode diagnostics

- Guard every diagnostic with `typeof ngDevMode === 'undefined' || ngDevMode` so it tree-shakes away.
- Say what is wrong and how to fix it, and name the part. A missing parent is a thrown error from `injectCckX(partName)`; misconfiguration (missing label, duplicate value) is a `console.warn` in a dev-only `afterNextRender`.
