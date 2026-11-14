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
  /**
   * The host element and its Badges. Each Badge must be a direct child. When not set, the container is empty.
   *
   * @example
   * <BadgeContainer position="top-right">
   *   <Button>Inbox</Button>
   *   <Badge :content="2" />
   * </BadgeContainer>
   */
  default?(): unknown;
}>();

const themeAttrs = useThemeAttrs(badgeContainerAnatomy);
const parts = computed(() => getBadgeContainerProps({ position: props.position }));

const root = useTemplateRef<ComponentPublicInstance>('root');

defineExpose({
  /**
   * The DOM element of the BadgeContainer: the `<div>`, or the element of the `as` component or the `asChild`
   * child. It is `null` before mount.
   *
   * @example
   * <BadgeContainer ref="box"><Button>Inbox</Button><Badge :content="2" /></BadgeContainer>
   * <!-- In the script: const box = useTemplateRef('box'); then box.value?.element is the element. -->
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
