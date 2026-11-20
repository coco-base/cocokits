<script setup lang="ts">
import { useTemplateRef, type ComponentPublicInstance } from 'vue';
import { getTrailingProps, trailingAnatomy } from '@cocokits/machines/trailing';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { rootElementOf } from '../internal/root-element';
import type { TrailingProps } from './trailing.types';

defineOptions({ name: 'CckTrailing' });

withDefaults(defineProps<TrailingProps>(), { as: 'div', asChild: false });

defineSlots<{
  /**
   * The content of the Trailing. When not set, the Trailing is an empty element.
   *
   * @example
   * <Trailing>Go</Trailing>
   */
  default?(): unknown;
}>();

const themeAttrs = useThemeAttrs(trailingAnatomy);
const parts = getTrailingProps();

const root = useTemplateRef<ComponentPublicInstance>('root');

defineExpose({
  /**
   * The DOM element of the Trailing: the `<div>`, or the element of the `as` component or the `asChild` child. It is
   * `null` before mount.
   *
   * @example
   * <Trailing ref="trailing">Go</Trailing>
   * <!-- In the script: const trailing = useTemplateRef('trailing'); then trailing.value?.element is the element. -->
   *
   * @cckSemantic none
   * @cckParity Templates reach the DOM node through the component ref.
   */
  get element(): Element | null {
    return rootElementOf(root.value);
  },
});
</script>

<template>
  <Primitive ref="root" :as="as" :as-child="asChild" v-bind="{ ...themeAttrs.root, ...parts.root }"><slot /></Primitive>
</template>
