# Polymorphism: `as` and `asChild`

Every part renders through one shared primitive in `@cocokits/vue-core`, so consumers can change the element (`as="a"`) or merge the part onto their own component (`asChild`). The component's rendered contract fixes the default element of each part; `as`/`asChild` are the consumer's deviation, and the part keeps its role, state and keyboard behaviour on it.

- A part whose element is fixed by its behaviour contract takes no `as`/`asChild`: the Label is always a native `label`, and the `DialogContent` is always a native `dialog`.
- Every part that renders an element takes `as` (`AsTag | Component`) with its current element as the default. A root that renders no element (`DialogRoot`, `PopoverRoot`, `TooltipRoot`) takes none.
- Part props extend the primitive's props (`as`, `asChild`) and forward them. `as` is typed `AsTag | Component` (Reka UI), so a router link component works.
- The HTML void elements (`area`, `base`, `br`, `col`, `embed`, `hr`, `img`, `input`, `link`, `meta`, `source`, `track`, `wbr`) get no default slot (hydration mismatch otherwise).
- `asChild` merges onto the first element or component child; text and comments are skipped. Warn in development unless there is exactly one such child, also for an empty slot.
- Child props win over ours, except the attrs named in `priorityAttrs` (the state markers the part sets now, such as the disabled ones); `class`/`style` merge; listeners chain with the child's first.
- `asChildContent` (a function returning vnodes) replaces the children of the `asChild` child and keeps the child vnode (directives, `ref`, props, scope ids); a part with content of its own, such as the Badge, the Tabs trigger and the Select parts, uses it.
- `as` is read inside the render function, so changing it at runtime works.
- **Non-button rendering policy.** The API decides the kind of a button-default part, never the rendered element: `as` is `'button'` (the default) for the native button; any other tag or component is non-native; with `asChild` the child keeps its own semantics, so the part adds no `type` and no policy (it still sets its role, state, ids and handlers). `type="button"` is rendered only on a native button, never on an `<a>`, a `<div>` or a component given to `as`, and never with `asChild`. A native `button` also gets `disabled`.
  - **Dialog and Popover trigger and Close** (the Base UI `useButton` policy): a non-native element gets `role="button"` and `tabindex="0"` (an author's own `role` or `tabindex` wins). Enter activates on keydown by clicking the element, so the part's click logic and a consumer `click` listener run; Space calls `preventDefault()` on keydown (the page does not scroll) and activates on keyup. A consumer keydown (Enter) or keyup (Space) listener that calls `preventDefault()` keeps the part as it is; a consumer listener runs first. An `<a href>` keeps the browser's own Enter activation, so it never activates twice, and activates on Space at keyup.
  - **Tabs trigger:** a non-native element keeps `role="tab"` and the machine's roving `tabindex`; Enter and Space select the tab on keydown unless a consumer keydown listener called `preventDefault()`. A disabled one gets `aria-disabled="true"` instead of `disabled` and ignores activation, but Space still does not scroll the page.
  - **Tooltip trigger:** a non-native element gets `tabindex="0"` and nothing else; focus shows the tooltip.
  - Vue has no development tag check for these parts, because `as` states the kind. Why: [rendered contract](../../why/rendered-contract.md).
- **Exception, the Button:** a non-button replacement is a link. Any `as` other than `button`, or `asChild`, renders link semantics (an `<a>` or a component that renders one), with no `role` and no Space handling, and the machine's disabled-link guard, which runs in the capture phase so a consumer `@click.capture` runs first and can veto it; `as="button"` stays a native button. The Non-button rendering policy bullet (`tabindex="0"`, Space and Enter handling, the kept role) does not apply to it (why: [rendered contract](../../why/rendered-contract.md)). In development, the part logs a `CocoKits:` error after mount when the rendered tag does not match.
- `asChild` works by cloning the child vnode; parts stay `<script setup>` only and ship no renderer-specific code.

Example (illustrative):

```vue
<Tabs.Trigger value="a" as-child><RouterLink to="/a">A</RouterLink></Tabs.Trigger>
```
