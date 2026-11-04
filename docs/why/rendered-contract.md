# Why: the rendered contract

Rules: [Selectors and component shape](../architecture.md#5-selectors-and-component-shape-angular-compound-components-all-frameworks). This file explains them and states no rules.

## Authoring shape differs per framework, the DOM does not

**Rejected alternatives.**
- *Radix-style sibling parts in every framework.* The Angular library uses content projection: one `cckTab` element per section, configured on its own element instead of through one big array input. That flexibility is worth keeping.
- *Content-projection-style APIs in React.* They break there:
  - inspecting `children` breaks when users wrap a tab in their own component or a fragment;
  - register-then-render shows headers only after mount, so the server renders an empty tab list. That is a hydration mismatch in Next.js.

**Why.**
- Each framework gets the authoring shape that gives its developers the best experience: projection in Angular, sibling parts linked by `value` in React and Vue.
- Behaviour, rendered DOM contract and therefore every theme stay identical.
- Projection works on the server in Angular: projected children are created, and register through DI, before the parent's view renders. The header list is complete on the server too.

**Cost.** Docs, examples and snippets differ per framework for compound components, and the spec describes both shapes.

## The element is the author's choice

Rules: [Selectors and component shape](../architecture.md#5-selectors-and-component-shape-angular-compound-components-all-frameworks), [Anatomy](../architecture.md#3-anatomy-and-the-styling-contract).

**Rejected alternatives.**
- *A fixed tag in the Angular selector (`div[cckBadgeContainer]`, a `<cck-badge>` tag).* The author may want the part on a `span`, a `li` or a link, and a fixed tag forbids it. React (`render`) and Vue (`as`, `asChild`) already allow it.
- *Naming the element in the anatomy description.* It reads as a rule and breaks as soon as the author picks another element.

**Why.**
- Parts, classes, `data-*` and roles are what themes and tests rely on, so they are shared. The element is not, so only the default is shared (`defaultElements` in the meta).
- A tag is fixed only when the behaviour contract needs a native element: a Button is a `button` or a link.

## One rendered contract per component

**Why.**
- Early implementations of the same component disagreed between frameworks, and between the hand-written and the machine-backed version, on the root element, focus target, number of parts, labelling and form behaviour. A theme cannot style all of them.
- Moving a hand-written component onto a machine would change its DOM. Rendering the spec's contract from the first release avoids that.
- One contract lets one theme and one conformance suite cover every framework.

## Ids come from the root id, and a linking value enters through `toIdSegment`

**Why.**
- A panel must name its trigger (`aria-labelledby`) and a trigger its panel (`aria-controls`) in the server HTML, whichever of the two the page writes first. In React and Vue the only fact both sides know during render is the item's value, so the id is the root id plus the value; Radix (`makeTriggerId`) and Reka UI do the same. A per-item generated key cannot pair two siblings before they register.
- Writing a value into an id is safe only when no two values give one id, so the value goes through the injective `toIdSegment` (a number and a text with the same digits stay different). Angular has one element per tab, so a generated key of that tab pairs the two halves and no value is involved.
- The rule used to say ids are never derived from item values. That kept ids stable against display text, which `toIdSegment` still does: the value is the author's key, never the label.

## Next.js is not a separate framework

**Why.**
- Next.js is React plus server rendering and React Server Components. It adds constraints, not a new adapter.
- Machines, cdk and the React package therefore avoid `window` and `document` at import time, use SSR-stable ids (`useId`, not a module counter), keep `'use client'` through the build, and produce the same markup for the server and for the first client render.
- The last constraint is also why compound components in React are sibling parts (see above).
- React unit and component tests cover Next.js. It needs no tests of its own.

## Server render and hydration tests for every framework, import safety for React only

**Rejected alternatives.**
- *Server render and hydration tests for React only.* Angular and Vue also render on the server, and a mismatch there breaks the first paint the same way.
- *An import-safety test in every framework.* Angular and Vue entries are exercised by their server render tests, which fail on any `window` access at import or render. Only React has entries that a Server Component imports without rendering them.

**Why.** The rendered contract must hold on the server in every framework. Import safety is a separate risk only where a module can be imported on the server and not rendered.

## A Button replacement is a link

**Rejected alternatives.**
- *The generic non-button policy for the Button* (`tabIndex` 0, Space and Enter handling, a kept `role="button"`, as Base UI does on a non-native element). It would change the DOM that the Angular `a[cckButton]` renders and that `buttonMeta` states (role `link`; Space does nothing on a link), so one theme and one conformance suite could no longer cover every framework.
- *Reading the rendered element to decide the kind.* A link component (`Link`, `RouterLink`) cannot be told apart from any other component by inspecting it.

**Why.**
- A Button has two elements, `<button>` and a link. A non-button replacement can only be the second, so the kind comes from the API and the link keeps its native role and keyboard behaviour. The rule is in [render-prop](../style-guides/react/render-prop.md).
- React follows Base UI's `nativeButton` flag and `render` prop.
- Vue follows Reka UI's `Primitive`: `as` takes a tag or a component and `asChild` merges onto the first child. Neither can be inspected to tell a link component from another component, so the API decides the kind; the rule is in [polymorphism](../style-guides/vue/polymorphism.md).

## Other button-default parts follow Base UI

**Why.**
- Dialog and Popover Trigger and Close, Tooltip Trigger and Tabs Trigger take the same `nativeButton` flag as the Button. Unlike the Button, their non-button replacement is not a link, so they keep Base UI's non-native policy (`role`, `tabIndex` 0, Enter on keydown, Space on keyup, a consumer `preventDefault()` vetoes). Angular has no non-native trigger, so the rendered contract is untouched.
- `type="button"` goes only on a native button, as in Base UI's `useButton`. On an `<a>`, `type` is a MIME hint.
- A Tooltip Trigger has nothing to activate, so a non-native one gets `tabindex="0"` only: focus is what opens the tooltip.
- The Tabs and Select root render only the `dir` the author passes. Radix renders the resolved direction, but Angular's `[cckTabs]` renders none, so the root DOM stays the same in every framework. Keys, placement and the portal host use the resolved direction.
