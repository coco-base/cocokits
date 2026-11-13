<script setup lang="ts">
import { useTemplateRef } from 'vue';
import { SvgIcon as BaseSvgIcon } from '@cocokits/vue/svg-icon';
import { provideThemeOptions } from '@cocokits/vue-core';
import type { SvgIconProps } from './svg-icon.types';

defineOptions({ name: 'SvgIcon' });

const props = withDefaults(defineProps<SvgIconProps>(), {
  label: undefined,
  size: undefined,
  color: undefined,
  rtlMirror: undefined,
});

const base = useTemplateRef<{ readonly element: Element | null }>('base');

defineExpose({
  /**
   * The DOM element of the root: the `<span>`. `null` before mount.
   *
   * @cckSemantic none
   * @remarks Templates reach the DOM node through the component ref.
   */
  get element(): Element | null {
    return base.value?.element ?? null;
  },
});

provideThemeOptions('svg-icon', () => ({ size: props.size, color: props.color, rtlMirror: props.rtlMirror }));
</script>

<template>
  <BaseSvgIcon ref="base" :icon-name="iconName" :label="label" />
</template>
