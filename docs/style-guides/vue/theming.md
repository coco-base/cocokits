# Theming in Vue

Shared rules: [theme-layer-per-framework](../themes/theme-layer-per-framework.md). Contract: [architecture](../../architecture.md) section 4.

- The runtime lives in `@cocokits/vue-core`; parts get their `data-*` attributes from it, bound with the attrs ([data-attrs-and-anatomy.md](./data-attrs-and-anatomy.md)). Options reach the parts by provide/inject; the runtime returns a computed, and its result without a theme is in [architecture §4](../../architecture.md#4-theme-configuration-size-variant-color-theme-only-options). Base contexts do not carry theme options.
- A component calls `useThemeAttrs(anatomy)` and binds the record of each part it renders ([architecture §10](../../architecture.md#10-simplicity-and-reuse), item 7).
- The wrapper (`packages/themes/<name>/vue/`) forwards every base prop, model, emit and slot (with its slot props). It may accept classes per part; it does not accept untyped attribute pass-through.

Example (illustrative; `provideThemeOptions` is a placeholder; use the runtime API of the theme package):

```vue
<script setup lang="ts">
const props = defineProps<SwitchProps>() // base props plus typed theme options
provideThemeOptions('switch', () => ({ size: props.size, color: props.color }))
</script>

<template>
  <Switch.Root v-bind="forwarded" v-model:checked="checked"><Switch.Thumb /></Switch.Root>
</template>
```
