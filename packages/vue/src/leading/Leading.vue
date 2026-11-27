<script setup lang="ts">
import { provide, useTemplateRef, type ComponentPublicInstance } from 'vue';
import { getLeadingProps, leadingAnatomy } from '@cocokits/machines/leading';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { rootElementOf } from '../internal/root-element';
import { FIELD_ZONE_KEY } from '../internal/use-field-control';
import type { LeadingProps } from './leading.types';

defineOptions({ name: 'CckLeading' });

withDefaults(defineProps<LeadingProps>(), { as: 'div', asChild: false });

defineSlots<{
  /**
   * The content of the Leading. When not set, the Leading is an empty element.
   *
   * @example
   * <Leading>Search</Leading>
   */
  default?(): unknown;
}>();

const themeAttrs = useThemeAttrs(leadingAnatomy);
const parts = getLeadingProps();
// A control in the Leading is not the field's control.
provide(FIELD_ZONE_KEY, true);

const root = useTemplateRef<ComponentPublicInstance>('root');

defineExpose({
  /**
   * The DOM element of the Leading: the `<div>`, or the element of the `as` component or the `asChild` child. It is
   * `null` before mount.
   *
   * @example
   * <Leading ref="leading">Search</Leading>
   * <!-- In the script: const leading = useTemplateRef('leading'); then leading.value?.element is the element. -->
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
