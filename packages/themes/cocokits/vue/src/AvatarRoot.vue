<script setup lang="ts">
import { useTemplateRef } from 'vue';
import { AvatarRoot as BaseAvatarRoot } from '@cocokits/vue/avatar';
import { provideThemeOptions } from '@cocokits/vue-core';
import type { AvatarRootProps } from './avatar.types';

defineOptions({ name: 'AvatarRoot' });

const props = withDefaults(defineProps<AvatarRootProps>(), { as: undefined, asChild: undefined, size: undefined });

defineSlots<{
  /** The `AvatarImage` and the `AvatarFallback`, or any content. */
  default?(): unknown;
}>();

const base = useTemplateRef<{ readonly element: Element | null }>('base');

defineExpose({
  /**
   * The DOM element of the Avatar: the `<span>`, or the element of the `as` component or `asChild` child.
   * `null` before mount.
   *
   * @cckSemantic none
   * @remarks Templates reach the DOM node through the component ref.
   */
  get element(): Element | null {
    return base.value?.element ?? null;
  },
});

provideThemeOptions('avatar', () => ({ size: props.size }));
</script>

<template>
  <BaseAvatarRoot ref="base" :as="as" :as-child="asChild"><slot /></BaseAvatarRoot>
</template>
