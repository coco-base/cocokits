<script setup lang="ts">
import { useTemplateRef, type ComponentPublicInstance } from 'vue';
import { getHintProps, hintAnatomy } from '@cocokits/machines/hint';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { rootElementOf } from '../internal/root-element';
import type { HintProps } from './hint.types';

defineOptions({ name: 'CckHint' });

withDefaults(defineProps<HintProps>(), { as: 'div', asChild: false });

defineSlots<{
  /** The text of the hint, optionally with an icon. */
  default?(): unknown;
}>();

const themeAttrs = useThemeAttrs(hintAnatomy);
const parts = getHintProps();

const root = useTemplateRef<ComponentPublicInstance>('root');

defineExpose({
  /**
   * The DOM element of the Hint: the `<div>`, or the element of the `as` component or `asChild` child.
   * `null` before mount.
   *
   * @cckSemantic none
   * @cckParity Vue-only member: templates reach the DOM node through the component ref.
   */
  get element(): Element | null {
    return rootElementOf(root.value);
  },
});
</script>

<template>
  <Primitive ref="root" :as="as" :as-child="asChild" v-bind="{ ...themeAttrs.root, ...parts.root }"><slot /></Primitive>
</template>
