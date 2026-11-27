<script setup lang="ts">
import { useTemplateRef } from 'vue';
import { Tag as BaseTag } from '@cocokits/vue/tag';
import { provideThemeOptions } from '@cocokits/vue-core';
import type { TagProps } from './tag.types';

defineOptions({ name: 'Tag' });

const props = withDefaults(defineProps<TagProps>(), {
  as: undefined,
  asChild: undefined,
  variant: undefined,
  color: undefined,
  size: undefined,
  dot: undefined,
});

defineSlots<{
  /** The text of the Tag. An `SvgIcon` can go before or after the text. When not set, the Tag is empty. */
  default?(): unknown;
}>();

const base = useTemplateRef<{ readonly element: Element | null }>('base');

defineExpose({
  /**
   * The DOM element of the Tag: the `<span>`, or the element of the `as` component or `asChild` child.
   * `null` before mount.
   *
   * @cckSemantic none
   * @remarks Templates reach the DOM node through the component ref.
   */
  get element(): Element | null {
    return base.value?.element ?? null;
  },
});

provideThemeOptions('tag', () => ({ variant: props.variant, color: props.color, size: props.size, dot: props.dot }));
</script>

<template>
  <BaseTag ref="base" :as="as" :as-child="asChild">
    <slot />
  </BaseTag>
</template>
