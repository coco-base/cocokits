# Data attributes, classes and CSS variables in React

Shared rules: [machines](../framework-agnostic/machines.md) (props per part); contract: [architecture](../../architecture.md#3-anatomy-and-the-styling-contract).

- Import the component's anatomy from `@cocokits/machines/<name>`; never write an anatomy file in `packages/react`. A part renders its fixed class as `className: <anatomy>.classes.<part>`.
- `data-side`/`data-align` on overlay content and arrow are rendered by the part from placement state ([overlays.md](./overlays.md)).
- Theme attributes come from the fw-core theme runtime on every part ([theming.md](./theming.md)) and are spread before `className`.
- Measured geometry values are set in a layout effect, not stored in state.
- A part renders no `style` and no prefixed CSS variable for a look (the theme owns it), and a `data-*` names a fact, never a look ([architecture §3](../../architecture.md#3-anatomy-and-the-styling-contract), [machines](../framework-agnostic/machines.md#props-per-part)).
- A part that lets the author choose the element (`render`) renders the meta's default element when none is given.

Example (illustrative):

```tsx
'data-selected': dataAttr(selected),
'data-disabled': dataAttr(disabled),
'data-orientation': ctx.orientation,
...themeAttrs.trigger,
className: A.classes.trigger,
```
