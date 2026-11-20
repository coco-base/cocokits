<script setup lang="ts">
import { useTemplateRef } from 'vue';
import { Button as BaseButton } from '@cocokits/vue/button';
import { provideThemeOptions } from '@cocokits/vue-core';
import type { ButtonProps } from './button.types';

defineOptions({ name: 'Button' });

const props = withDefaults(defineProps<ButtonProps>(), {
  disabled: undefined,
  as: undefined,
  asChild: undefined,
  variant: undefined,
  color: undefined,
  size: undefined,
});

defineSlots<{
  /** The content of the Button: text and icons. An icon-only Button needs `aria-label` or `aria-labelledby`. */
  default?(): unknown;
}>();

const base = useTemplateRef<{ readonly element: Element | null }>('base');

defineExpose({
  /**
   * The DOM element of the Button: the `<button>`, the `<a>` or the element of the `as` component.
   * `null` before mount.
   *
   * @cckSemantic none
   * @remarks Templates reach the DOM node through the component ref.
   */
  get element(): Element | null {
    return base.value?.element ?? null;
  },
});

provideThemeOptions('button', () => ({ variant: props.variant, color: props.color, size: props.size }));
</script>

<template>
  <BaseButton ref="base" :disabled="disabled" :as="as" :as-child="asChild">
    <slot />
  </BaseButton>
</template>
