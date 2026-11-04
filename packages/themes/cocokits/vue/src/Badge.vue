<script setup lang="ts">
import { useTemplateRef } from 'vue';
import { Badge as BaseBadge } from '@cocokits/vue/badge';
import { provideThemeOptions } from '@cocokits/vue-core';
import type { BadgeProps } from './badge.types';

defineOptions({ name: 'Badge' });

const props = withDefaults(defineProps<BadgeProps>(), {
  content: undefined,
  max: undefined,
  hide: undefined,
  as: undefined,
  asChild: undefined,
  variant: undefined,
  color: undefined,
  size: undefined,
});

defineSlots<{
  /** The element the Badge merges onto when `asChild` is set; the Badge puts its own content parts inside it. Ignored otherwise. */
  default?(): unknown;
}>();

const base = useTemplateRef<{ readonly element: Element | null }>('base');

defineExpose({
  /**
   * The DOM element of the Badge: the `<span>`, or the element of the `as` component or `asChild` child.
   * `null` before mount.
   *
   * @cckSemantic none
   * @remarks Vue-only member: templates reach the DOM node through the component ref.
   */
  get element(): Element | null {
    return base.value?.element ?? null;
  },
});

provideThemeOptions('badge', () => ({ variant: props.variant, color: props.color, size: props.size }));
</script>

<template>
  <BaseBadge ref="base" :content="content" :max="max" :hide="hide" :as="as" :as-child="asChild">
    <slot />
  </BaseBadge>
</template>
