# Classes, `data-*` state and attrs in templates

Shared rules: [machines](../framework-agnostic/machines.md) (props per part); contract: [architecture](../../architecture.md#3-anatomy-and-the-styling-contract).

## Rules

- Bind the fixed part class from the anatomy: `:class="<anatomy>.classes.<part>"`, with the anatomy imported from `@cocokits/machines/<name>`.
- Theme attributes come from the fw-core theme runtime and are bound with the attrs, before our own bindings ([theming.md](./theming.md)).
- Role and ARIA are bound in the template; they are not part of the anatomy.
- A part binds no `style` and no prefixed CSS variable for a look (the theme owns it), and a `data-*` names a fact, never a look ([architecture §3](../../architecture.md#3-anatomy-and-the-styling-contract), [machines](../framework-agnostic/machines.md#props-per-part)).
- A part that lets the author choose the element (`as`, `asChild`) renders the meta's default element when none is given.

Example binding order (illustrative):

```vue
<Primitive
  v-bind="{ ...$attrs, ...themeAttrs.trigger }"       <!-- 1. consumer attrs (inheritAttrs: false) and theme data-* -->
  :as="as" :as-child="asChild"
  :class="anatomy.classes.trigger"             <!-- 2. anatomy class -->
  role="tab"                                   <!-- 3. role, ARIA, state -->
  :aria-selected="selected"
  :data-selected="dataAttr(selected)"
  @click="onClick"                             <!-- 4. listeners -->
>
```

## Attrs fallthrough

- Set `defineOptions({ inheritAttrs: false })` for a multi-root template (control plus hidden input, guards plus content) or when attrs must land on an element that is not the root; then bind `v-bind="$attrs"` on the element that owns the semantics.
- `$attrs` goes before explicit bindings so our ARIA and `data-*` win; `class` and `style` merge anyway, and listeners chain with the consumer's first.

## Consumer veto

The rule is in [machines](../framework-agnostic/machines.md#props-per-part). **Exception:** the Trigger and Close parts of a Dialog and Popover send their click whatever a consumer `preventDefault()` did, as Reka's parts do; the veto of a keydown on a non-native `as` host stays. A consumer refuses a dismissal with the Content emits ([overlays](./overlays.md)), not by preventing the click of a part. In a Vue handler:

```ts
function onKeydown(event: KeyboardEvent) {
  if (event.key !== ' ' && event.key !== 'Enter') return
  if (event.defaultPrevented) return // consumer veto
  event.preventDefault()             // ours: not a veto
  activate()
}
```
