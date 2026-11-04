# Angular style guide

Rules specific to hand-written CocoKits Angular components (`@cocokits/angular/<name>`) and their theme directives (`@cocokits/theme-<name>-angular`). Cross-cutting rules (layers, styling contract, SSR safety, accessibility, one rendered contract per component, theme layer) are in [architecture](../../architecture.md); framework-free code is in [framework-agnostic](../framework-agnostic/index.md). This guide only adds what Angular changes. Component names below are examples of a general rule, never a spec of that component.

## Load on demand

| File | Load when |
|---|---|
| [package-and-files.md](./package-and-files.md) | Creating an entry point, naming files, writing `index.ts`, importing from `@cocokits/*` |
| [components-and-selectors.md](./components-and-selectors.md) | Choosing a selector, decorator metadata, `exportAs`, sharing code between directives of one component, config tokens, DI scope |
| [signals-and-inputs.md](./signals-and-inputs.md) | Inputs, models, outputs, derived state, change details, ids |
| [host-bindings-and-data-attrs.md](./host-bindings-and-data-attrs.md) | Writing the `host` object: classes, `data-*`, ARIA, listeners and their exceptions, collisions, animations |
| [compound-components.md](./compound-components.md) | Any parent/child component; collection semantics; slots |
| [forms.md](./forms.md) | A part that holds a form value |
| [theming.md](./theming.md) | Theme attributes in base parts; writing a theme directive |
| [overlays.md](./overlays.md) | Dialog, popover, tooltip, menu, select content: portal, positioning, dismiss, focus |
| [keyboard-and-a11y.md](./keyboard-and-a11y.md) | Roving focus, key managers, RTL, modal focus, dev diagnostics |
| [lifecycle-and-ssr.md](./lifecycle-and-ssr.md) | Render hooks, `DestroyRef`, zoneless, SSR safety |
| [machine-backed.md](./machine-backed.md) | Using framework-free shared behaviour from an Angular component |
| [testing.md](./testing.md) | Writing Vitest specs and harnesses |
| [tsdoc.md](./tsdoc.md) | TSDoc on public symbols |
