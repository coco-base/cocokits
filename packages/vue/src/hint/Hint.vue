<script setup lang="ts">
import { useTemplateRef, type ComponentPublicInstance } from 'vue';
import { getHintProps, hintAnatomy } from '@cocokits/machines/hint';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { rootElementOf } from '../internal/root-element';
import type { HintProps } from './hint.types';

defineOptions({ name: 'CckHint' });

withDefaults(defineProps<HintProps>(), { as: 'div', asChild: false });

defineSlots<{
  /**
   * The text of the hint, with an icon if you like. When not set, the hint is empty.
   *
   * @example
   * <Hint><SvgIcon icon-name="info" /> We only use it for the receipt.</Hint>
   */
  default?(): unknown;
}>();

const themeAttrs = useThemeAttrs(hintAnatomy);
const parts = getHintProps();

const root = useTemplateRef<ComponentPublicInstance>('root');

defineExpose({
  /**
   * The DOM element of the Hint: the `<div>`, or the element of the `as` component or the `asChild` child. It is
   * `null` before mount.
   *
   * @example
   * <Hint ref="hint">We only use it for the receipt.</Hint>
   * <!-- In the script: const hint = useTemplateRef('hint'); then hint.value?.element is the element. -->
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
