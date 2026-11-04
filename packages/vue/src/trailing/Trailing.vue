<script setup lang="ts">
import { useTemplateRef, type ComponentPublicInstance } from 'vue';
import { getTrailingProps, trailingAnatomy } from '@cocokits/machines/trailing';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { rootElementOf } from '../internal/root-element';
import type { TrailingProps } from './trailing.types';

defineOptions({ name: 'CckTrailing' });

withDefaults(defineProps<TrailingProps>(), { as: 'div', asChild: false });

defineSlots<{
  /** The content. */
  default?(): unknown;
}>();

const themeAttrs = useThemeAttrs(trailingAnatomy);
const parts = getTrailingProps();

const root = useTemplateRef<ComponentPublicInstance>('root');

defineExpose({
  /**
   * The DOM element of the Trailing: the `<div>`, or the element of the `as` component or `asChild` child.
   * `null` before mount.
   *
   * @cckSemantic none
   * @remarks Vue-only member: templates reach the DOM node through the component ref.
   */
  get element(): Element | null {
    return rootElementOf(root.value);
  },
});
</script>

<template>
  <Primitive ref="root" :as="as" :as-child="asChild" v-bind="{ ...themeAttrs.root, ...parts.root }"><slot /></Primitive>
</template>
