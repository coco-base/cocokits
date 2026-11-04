# Testing React components

Shared rules: [component-tests](../testing/component-tests.md).

- Run component tests in `<StrictMode>` so missing cleanups and effect-driven callbacks surface.
- Assert state through ARIA and `data-*` (`data-selected` present or absent), never through classes or internal state.
- Controlled and uncontrolled state, `null` kept, and the consumer's `preventDefault()` veto ([controlled-state.md](./controlled-state.md)).
- `render` and `ref` for every part ([render-prop.md](./render-prop.md)): the ref reaches the element, the fixed class survives, both `render` forms keep all props.
- Form controls ([forms.md](./forms.md)) and overlays ([overlays.md](./overlays.md)) as listed in those files.
- Server render and hydration without warnings, owned by [architecture §9](../../architecture.md#9-tests-and-quality-gates) and [component-tests.md](../testing/component-tests.md); a package without the setup adds it.
