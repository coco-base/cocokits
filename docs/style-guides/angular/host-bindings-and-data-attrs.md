# Host bindings, classes and `data-*`

How a part writes its DOM contract (class, `data-*`, ARIA, listeners) through the `host` object. The contract itself (fixed class, `data-*` naming, public API, CSS isolation) is in [architecture](../../architecture.md). Why: [styling contract](../../why/styling-contract.md).

## Rules

- Write the whole contract in the `host` object, listeners included (`'(click)': 'onClick($event)'`, `'(document:keydown)': …`). Do not use `@HostBinding` / `@HostListener`, `ngClass`, `ngStyle`, `Renderer2.addClass` for state, `nativeElement.setAttribute`, `addEventListener` or `Renderer2.listen`, except in a case under [Exceptions](#exceptions). Lint rejects `addEventListener`, `removeEventListener` and a `'cck-…'` class string in Angular code; a file that uses an exception is a [lint exception](../workspace/targets.md#lint-exceptions).
- The `class` is the only part identifier, and it comes from the anatomy through the machine props: `'[class]': 'props().class'`, never a typed string. `host` metadata cannot read `anatomy.classes.root` (AOT error NG5001, the compiler cannot evaluate the `defineAnatomy` call). No modifier classes (`cck-x__part--selected`, `cck-x--size-lg`).
- A base part writes no `[style]`, `[style.*]` or prefixed CSS variable for a look; the theme owns visual items ([architecture §4](../../architecture.md#4-theme-configuration-size-variant-color-theme-only-options)). A `data-*` names a fact, never a look (`data-empty`, not `data-dot`).
- Everything that varies is a `data-*` attribute: booleans are presence attributes (`'[attr.data-selected]': 'selected() ? "" : null'`), named values are value attributes (`'[attr.data-orientation]': 'orientation()'`).
- Base directives ship no CSS. A part that hides itself renders the native `hidden` attribute; the theme restates `[hidden]` for any part it gives a `display` ([css-conventions](../themes/css-conventions.md#specificity-and-layering)).

```ts
// Example (illustrative)
host: {
  '[class]': 'props().class',
  'role': 'switch',
  'type': 'button',
  '[id]': 'id()',
  '[disabled]': 'disabled()',
  '[attr.aria-checked]': 'checked()',
  '[attr.data-checked]': 'checked() ? "" : null',
  '[attr.data-disabled]': 'disabled() ? "" : null',
  '[attr.data-focus-visible]': 'focusVisible() ? "" : null',
  '(focus)': 'focusVisible.set(element.matches(":focus-visible"))',
  '(blur)': 'onBlur()',
},
```

Every `data-*` a part renders belongs to the component's contract; do not render undeclared attributes.

## Exceptions

The only cases where a part leaves the `host` object. A new case adds a row with its reason before code uses it.

Listener order: Angular registers every listener for one event on one element (the host listeners of all directives and the template listener) as one DOM listener and calls them in turn, in the consumer's `imports` order, not the template order.

| Case | API | Why `host` cannot do it |
|---|---|---|
| Theme attributes of a part | `Renderer2`, as [theming](./theming.md) says | Their names come from the `ThemeConfig` at runtime; `host` keys are fixed at compile time |
| Activation listener of a control or of an overlay's trigger and Close | `listenLast` from `@cocokits/angular-core` (`addEventListener` in `afterNextRender`, removed in `DestroyRef.onDestroy`) | It must run after the consumer's own listener so the consumer can veto; a `host` listener cannot be placed after it (listener order above), a listener added after the first render runs last. A click made before hydration never reaches it, so the part also has a `host` `(click)` that calls `afterReplay` (it acts only on an event Angular replays, after the consumer's listeners and only if none prevented the default) |
| Press outside an open list that must be decided before the focus move it causes (the Select) | `addEventListener` on the document in the capture phase, started outside the zone with the dismiss layer and removed with it (`createTriggerDismissLayer` in `@cocokits/cdk/dismissal`) | A `host` listener cannot be capture-phase, starts for the whole life of the part instead of the open list, and runs inside the zone on every press of the page; the focus move of a press must wait until the press is decided |
| Guard that stops other listeners (the click guard of a disabled `a[cckButton]` or `a[cckTabNavLink]`) | `listenFirst` from `@cocokits/angular-core` (a capture-phase `addEventListener` in `afterNextRender`, removed in `DestroyRef.onDestroy`) | A `host` listener cannot stop the others (they are one DOM listener) and `host` has no capture phase; a capture listener runs before that one |

A part that uses a row names it in its TSDoc and keeps a test that fails without it (`button-anchor-guard.test.ts`, `tab-nav.test.ts`).

## Collision rules

- A consumer's static attribute beats a static host attribute (`type="submit"` overrides `type: 'button'`). Dynamic beats static. When both are dynamic, the host binding wins.
- Two directives on one element may each bind different `[attr.data-*]` names; this is what makes same-selector theme directives possible. Theme option names never equal reserved base attribute names, so they never bind the same attribute.
- A consumer `[disabled]` binding targets the directive input (inputs win over native properties); the host then reflects it to the DOM property.

## Animations

- Behaviour emits state (`data-state="open|closed"`, or enter/exit attributes); theme CSS animates it.
- In templates we own, use `animate.enter` / `animate.leave` so removal waits for the CSS animation. Do not use `@angular/animations`.
