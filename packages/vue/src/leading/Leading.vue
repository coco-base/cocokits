<script setup lang="ts">
import { useTemplateRef, type ComponentPublicInstance } from 'vue';
import { getLeadingProps, leadingAnatomy } from '@cocokits/machines/leading';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { rootElementOf } from '../internal/root-element';
import type { LeadingProps } from './leading.types';

defineOptions({ name: 'CckLeading' });

withDefaults(defineProps<LeadingProps>(), { as: 'div', asChild: false });

defineSlots<{
  /** The content. */
  default?(): unknown;
}>();

const themeAttrs = useThemeAttrs(leadingAnatomy);
const parts = getLeadingProps();

const root = useTemplateRef<ComponentPublicInstance>('root');

defineExpose({
  /**
   * The DOM element of the Leading: the `<div>`, or the element of the `as` component or `asChild` child.
   * `null` before mount.
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
