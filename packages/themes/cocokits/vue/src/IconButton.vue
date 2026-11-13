<script setup lang="ts">
import { useTemplateRef } from 'vue';
import { IconButton as BaseIconButton } from '@cocokits/vue/icon-button';
import { provideThemeOptions } from '@cocokits/vue-core';
import type { IconButtonProps } from './icon-button.types';

defineOptions({ name: 'IconButton' });

const props = withDefaults(defineProps<IconButtonProps>(), {
  disabled: undefined,
  as: undefined,
  asChild: undefined,
  variant: undefined,
  color: undefined,
  size: undefined,
  rounded: undefined,
});

defineSlots<{
  /** The icon of the button: a `SvgIcon`, or your own decorative `<svg aria-hidden="true">`. No text. */
  default?(): unknown;
}>();

const base = useTemplateRef<{ readonly element: Element | null }>('base');

defineExpose({
  /**
   * The DOM element of the IconButton: the `<button>`, the `<a>` or the element of the `as` component.
   * `null` before mount.
   *
   * @cckSemantic none
   * @remarks Templates reach the DOM node through the component ref.
   */
  get element(): Element | null {
    return base.value?.element ?? null;
  },
});

provideThemeOptions('icon-button', () => ({
  variant: props.variant,
  color: props.color,
  size: props.size,
  rounded: props.rounded,
}));
</script>

<template>
  <BaseIconButton ref="base" :disabled="disabled" :as="as" :as-child="asChild">
    <slot />
  </BaseIconButton>
</template>
