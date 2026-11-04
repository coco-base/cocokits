# Vue style guide

Scope: hand-written CocoKits Vue components (`@cocokits/vue/<name>`), the Vue adapter package (`@cocokits/vue-core`) and Vue theme wrappers (`@cocokits/theme-<name>-vue`). Only what is specific to Vue is written here; everything cross-framework is in [docs/architecture.md](../../architecture.md) and the [framework-agnostic guide](../framework-agnostic/index.md). Component names in these files (Tabs, Switch, Popover, ...) are examples of a rule, never a spec.

## Load on demand

| File | Load when |
|---|---|
| [structure-and-imports.md](./structure-and-imports.md) | Creating a component folder or `index.ts`, deciding which package a symbol comes from |
| [components-and-props.md](./components-and-props.md) | Writing or reviewing any SFC: macros, typed props/emits/slots, reactivity, templates, refs, TSDoc |
| [models.md](./models.md) | `modelValue` prop, `update:` emit and `useModel`, change details, controlled vs initial value, `null` |
| [compound-parts.md](./compound-parts.md) | Root/part components: context, collections, roving focus, ids |
| [polymorphism.md](./polymorphism.md) | `as` / `asChild`, non-button renderings |
| [data-attrs-and-anatomy.md](./data-attrs-and-anatomy.md) | Binding classes, `data-*` state, theme attrs and `$attrs` in a template |
| [ssr.md](./ssr.md) | Hydration, ids, post-mount DOM work |
| [overlays.md](./overlays.md) | Popover, dialog, tooltip, menu, select content |
| [theming.md](./theming.md) | Theme attributes in base parts; a theme wrapper |
| [forms.md](./forms.md) | Form controls: hidden input, native events, `form`, fieldset, validation, reset |
| [machine-backed.md](./machine-backed.md) | A part whose behaviour comes from `@cocokits/machines/<name>` |
| [testing.md](./testing.md) | Writing or fixing Vue tests |
| [docs-and-stories.md](./docs-and-stories.md) | TSDoc for public props, emits, slots and models |

Related areas: [framework-agnostic](../framework-agnostic/index.md), [themes](../themes/index.md), [testing](../testing/index.md), [docs](../docs/index.md), [accessibility](../accessibility/index.md), [workspace](../workspace/index.md), [glossary](../../glossary.md).
