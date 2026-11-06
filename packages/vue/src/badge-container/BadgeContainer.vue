<script setup lang="ts">
import { computed, useTemplateRef, type ComponentPublicInstance } from 'vue';
import {
  BADGE_CONTAINER_DEFAULTS,
  badgeContainerAnatomy,
  getBadgeContainerProps,
} from '@cocokits/machines/badge-container';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { rootElementOf } from '../internal/root-element';
import type { BadgeContainerProps } from './badge-container.types';

defineOptions({ name: 'CckBadgeContainer' });

const props = withDefaults(defineProps<BadgeContainerProps>(), {
  position: BADGE_CONTAINER_DEFAULTS.position,
  as: 'div',
  asChild: false,
});

defineSlots<{
  /** The host element and its Badges, which must be direct children. */
  default?(): unknown;
}>();

const themeAttrs = useThemeAttrs(badgeContainerAnatomy);
const parts = computed(() => getBadgeContainerProps({ position: props.position }));

const root = useTemplateRef<ComponentPublicInstance>('root');

defineExpose({
  /**
   * The DOM element of the BadgeContainer: the `<div>`, or the element of the `as` component or `asChild` child.
   * `null` before mount.
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
