<script setup lang="ts">
import { inject, onBeforeUnmount, provide, watch } from 'vue';
import { createIconRegistry, type IconLoader } from '@cocokits/cdk/icon-registry';
import { ICON_REGISTRY_KEY, type IconProviderProps } from './icon-registry';

defineOptions({ name: 'CckIconProvider' });

const props = defineProps<IconProviderProps>();

defineSlots<{
  /** The subtree that reads the icons. */
  default?(): unknown;
}>();

const registry = createIconRegistry(inject(ICON_REGISTRY_KEY, undefined));
/** The loader last registered for each name, so a parent re-render with the same loaders does not drop caches. */
const registered = new Map<string, IconLoader>();

function registerLazy(lazyIcons: IconProviderProps['lazyIcons']): void {
  for (const [name, load] of Object.entries(lazyIcons ?? {})) {
    if (registered.get(name) === load) continue;
    registered.set(name, load);
    registry.registerIcon(name, load);
  }
}

if (props.icons) registry.registerIcons(props.icons);
registerLazy(props.lazyIcons);
provide(ICON_REGISTRY_KEY, registry);

// A later change registers the new records too: names are replaced, none is removed.
watch(
  () => props.icons,
  (icons) => {
    if (icons) registry.registerIcons(icons);
  },
);
watch(() => props.lazyIcons, registerLazy);
onBeforeUnmount(() => {
  registry.destroy();
});
</script>

<template>
  <slot />
</template>
