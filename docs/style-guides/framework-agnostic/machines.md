# Machines (`@cocokits/machines/<name>`)

What is specific to the framework-free behaviour of one component. What a machine is, its entry points and the rule that state binding is an adapter concern are in [docs/architecture.md](../../architecture.md). Component names below are illustrations. Why: [layers](../../why/layers.md).

A machine package holds one component's anatomy, meta, behaviour and the props each part needs. It has one subpath per component and no root entry. Framework packages import the anatomy and meta from here and never define their own.

## Adoption

- A component may ship hand-written first and move onto a machine later. Its rendered DOM and public API do not change when it does.
- Don't use Zag.js or XState as the machine runtime.

### Parts backed by a machine (every framework)

A part whose behaviour comes from a machine keeps the same props, rendered contract, `data-*`, classes and tests as a hand-written part; only the inside changes, and the existing component tests pass unchanged. Framework files add only their delta ([angular](../angular/machine-backed.md), [react](../react/machine-backed.md), [vue](../vue/machine-backed.md)).

- How machine state is bound to the framework's reactivity is an adapter concern in `@cocokits/<fw>-core`; no guide fixes an API for it. Machine state is read through the adapter, not copied into local state and not mirrored with an effect or watcher, and prop changes reach the machine without one.
- The machine does not know about themes; the part adds theme attributes.
- Keyboard, registration, id and measurement logic that lives in the machine or cdk is not duplicated in the part. When the machine returns props for a part (class, `data-*`, ARIA), the part binds them as returned and does not rewrite the same attributes by hand.

## Props per part

- The machine produces, for each part, the props that part needs: ids, role, ARIA, `data-*`, event handlers and fixed class. Classes come from the anatomy, never hand-written strings.
- Producing props is pure: it reads state and props only. No DOM, timers, `Date.now()` or `Math.random()`, and no events sent while computing. The result is identical on the server and on the first client render; values that need the DOM (measured sizes, focus-visible, placement) start at a deterministic default and update after mount.
- The machine takes no theme argument and never sees `ThemeConfig`; the theme layer adds `data-size`, `data-variant` and the like.
- Handlers check `event.defaultPrevented` first (a consumer handler merged before ours can veto), then call their own `preventDefault()` if needed, then send the event. Our own `preventDefault()` never counts as a veto.
- Render boolean `data-*` with `dataAttr(b)` from `@cocokits/utils` (`''` or `undefined`, never `"false"`). `"false"` is emitted only where ARIA requires it (`aria-selected="false"`, `aria-expanded="false"`). Named values are value attributes. Every `data-*` a part emits is declared in the component's meta; an item may carry `data-value` for keyboard lookup.
- Base-only geometry (measured sizes) uses unprefixed CSS variables written on the part; prefixed variables belong to the theme. The one unprefixed variable a theme sets is `--side-offset`, the gap between an overlay and its anchor, which the positioning module reads (React and Vue overlay content may override it with a `sideOffset` number; the machine has no prop for it). A part writes no inline style and no prefixed variable for a look.
- Decide base or theme before a prop exists ([architecture §4](../../architecture.md#4-theme-configuration-size-variant-color-theme-only-options)). A prop whose only effect is visual (`radius`, `offset`, `dot`) is a theme option or a documented theme custom property, never a machine prop. A `data-*` names a fact (`data-empty`), never a look. Hiding the base promises renders the native `hidden` attribute.
- A machine imports another machine's contract through its entry, with no cycle ([architecture §2](../../architecture.md#2-layers-and-packages)). Anatomy descriptions and `defaultElements` follow [architecture §3](../../architecture.md#3-anatomy-and-the-styling-contract).
- Role and ARIA are behaviour and are rendered here, never declared in the anatomy. The meta records the expected role per part only as test expectations, never read at runtime.
- Use the vocabulary of the DOM (`class`, `onClick`, `htmlFor`, `tabIndex`); each framework adapter translates it to its own conventions.

## State and events

- Event names are `PART.ACTION` in upper snake case (`'TRIGGER.CLICK'`, `'VALUE.SET'`); the event type is a discriminated union.
- Keyboard events are semantic, not physical: arrow keys are mapped through the text direction before they reach the machine, so a machine never sees `dir`-dependent keys.
- Controlled and uncontrolled behave the same. A change callback fires only for a real change, as [architecture.md](../../architecture.md) section 6 defines, and never from inside a transition. After a rejected controlled change, the DOM is re-synced to the controlled value.
- Do not add states that only rename a context value.
- How a machine structures its state internally is its own choice; no particular state API is required.

## Ids

- `id` is supplied by the adapter and is SSR-stable (the framework's id generator, never `Math.random`, `crypto.randomUUID` or a module counter). Per-item ids are `<adapter id>-<part>-<stable item key>` where the key comes from the item's registration, never from its display value. A consumer `id` replaces the generated root id only.
- Where sibling parts link through a consumer value, the value appears in the id only through the injective `toIdSegment` from `@cocokits/utils`, so values that differ only in whitespace or punctuation never collide. Every IDREF resolves or is omitted: `aria-controls` points only at an element that is mounted.
- User-visible strings are props with defaults; dates and numbers go through the cdk i18n modules, not `Date` or `parseFloat` in a machine. `dir` and `locale` come from the adapter.

## Keyboard as data

- The keyboard table of the meta lists every row (keys, part, condition, effect, APG reference, and whether the browser already provides it natively). Behaviour is dispatched from a typed keymap, and a test asserts the keymap and the meta table agree in both directions.
- Every non-native row has a test through the machine's handler, in both text directions and both orientations where it applies. Native rows are tested as component tests in each framework.
- Ignore `event.isComposing` (IME) and modified keys unless the meta lists them.
