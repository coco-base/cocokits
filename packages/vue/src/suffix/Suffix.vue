<script setup lang="ts">
import { useTemplateRef, type ComponentPublicInstance } from 'vue';
import { getSuffixProps, suffixAnatomy } from '@cocokits/machines/suffix';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { rootElementOf } from '../internal/root-element';
import type { SuffixProps } from './suffix.types';

defineOptions({ name: 'CckSuffix' });

withDefaults(defineProps<SuffixProps>(), { as: 'div', asChild: false });

defineSlots<{
  /**
   * The content of the Suffix. When not set, the Suffix is an empty element.
   *
   * @example
   * <Suffix>kg</Suffix>
   */
  default?(): unknown;
}>();

const themeAttrs = useThemeAttrs(suffixAnatomy);
const parts = getSuffixProps();

const root = useTemplateRef<ComponentPublicInstance>('root');

defineExpose({
  /**
   * The DOM element of the Suffix: the `<div>`, or the element of the `as` component or the `asChild` child. It is
   * `null` before mount.
   *
   * @example
   * <Suffix ref="suffix">kg</Suffix>
   * <!-- In the script: const suffix = useTemplateRef('suffix'); then suffix.value?.element is the element. -->
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
