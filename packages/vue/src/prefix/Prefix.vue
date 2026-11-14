<script setup lang="ts">
import { useTemplateRef, type ComponentPublicInstance } from 'vue';
import { getPrefixProps, prefixAnatomy } from '@cocokits/machines/prefix';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { rootElementOf } from '../internal/root-element';
import type { PrefixProps } from './prefix.types';

defineOptions({ name: 'CckPrefix' });

withDefaults(defineProps<PrefixProps>(), { as: 'div', asChild: false });

defineSlots<{
  /**
   * The content of the Prefix. When not set, the Prefix is an empty element.
   *
   * @example
   * <Prefix>$</Prefix>
   */
  default?(): unknown;
}>();

const themeAttrs = useThemeAttrs(prefixAnatomy);
const parts = getPrefixProps();

const root = useTemplateRef<ComponentPublicInstance>('root');

defineExpose({
  /**
   * The DOM element of the Prefix: the `<div>`, or the element of the `as` component or the `asChild` child. It is
   * `null` before mount.
   *
   * @example
   * <Prefix ref="prefix">$</Prefix>
   * <!-- In the script: const prefix = useTemplateRef('prefix'); then prefix.value?.element is the element. -->
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
