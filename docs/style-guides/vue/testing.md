# Testing Vue components

Shared rules: [component-tests](../testing/component-tests.md).

- Read emits by name and check `details.reason`.
- Models ([models.md](./models.md)): initial value (prop without listener), controlled (prop plus listener), a parent that ignores updates keeps the UI and the hidden input, `null` stays `null`.
- Emitted `update:*` and `*Change` events with `details.reason`; no change event when the parent sets the prop.
- `as` and `asChild` renderings: tabindex, Space/Enter activation, `aria-disabled` when disabled; a consumer handler that calls `preventDefault()` vetoes, ours does not.
- Server render (`renderToString` output) and hydration without warnings: [ssr.md](./ssr.md); the rule is [architecture §9](../../architecture.md#9-tests-and-quality-gates).
- Form controls ([forms.md](./forms.md)), overlays ([overlays.md](./overlays.md)) and theme wrappers ([theming.md](./theming.md)) as listed in those files.
