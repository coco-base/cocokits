# React style guide (incl. Next.js)

How to write headless components for `@cocokits/react`: compound parts, state, SSR, overlays, theming, forms and tests. Only what is specific to React is written here; everything cross-framework is in [docs/architecture.md](../../architecture.md) and the [framework-agnostic guide](../framework-agnostic/index.md). Next.js is React plus SSR/RSC, not a separate framework (why: [rendered contract](../../why/rendered-contract.md)). Component names in these files (Tabs, Switch, Popover, ...) are examples of a rule, never a spec.

## Load on demand

| File | Load when |
|---|---|
| [package-layout.md](./package-layout.md) | Creating files or exports, `'use client'` placement, naming, TypeScript conventions |
| [compound-parts.md](./compound-parts.md) | Writing a part: context, prop order, refs, ids, collections, Rules of React |
| [render-prop.md](./render-prop.md) | Element override (`render`), non-button replacements |
| [controlled-state.md](./controlled-state.md) | Any `value`/`checked`/`open` prop, change callbacks, `null` |
| [data-attrs-and-anatomy.md](./data-attrs-and-anatomy.md) | Rendering classes, `data-*` and CSS variables in a part |
| [nextjs-ssr.md](./nextjs-ssr.md) | Next.js, SSR, hydration, RSC, `'use client'` |
| [overlays.md](./overlays.md) | Dialog, popover, tooltip, menu, select content |
| [theming.md](./theming.md) | Theme attributes in base parts, theme wrappers |
| [forms.md](./forms.md) | Form controls: hidden native input, reset, validation |
| [machine-backed.md](./machine-backed.md) | A part whose behaviour comes from `@cocokits/machines/<name>` |
| [internals.md](./internals.md) | Rules for the small shared helpers in `packages/react/src/internal/` |
| [testing.md](./testing.md) | Writing or fixing React tests |
| [tsdoc.md](./tsdoc.md) | TSDoc for public props and parts |

Related areas: [framework-agnostic](../framework-agnostic/index.md), [themes](../themes/index.md), [testing](../testing/index.md), [accessibility](../accessibility/index.md), [workspace](../workspace/index.md), [glossary](../../glossary.md).
