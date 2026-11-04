<script setup lang="ts">
import { computed, mergeProps, onBeforeUnmount, onMounted, useAttrs, watch, type ComponentPublicInstance } from 'vue';
import type { OverlayVirtualAnchor } from '@cocokits/cdk/positioning';
import { getPopoverProps, popoverAnatomy } from '@cocokits/machines/popover';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { liveElementRef } from '../internal/live-element';
import { usePopoverContext } from './popover.context';
import type { PopoverAnchorProps } from './popover.types';

defineOptions({ name: 'CckPopoverAnchor', inheritAttrs: false });

const props = withDefaults(defineProps<PopoverAnchorProps>(), { reference: undefined, as: 'div', asChild: false });
defineSlots<{
  /** The content of the anchor. */
  default?(): unknown;
}>();

const ctx = usePopoverContext('PopoverAnchor');
const themeAttrs = useThemeAttrs(popoverAnatomy);
const attrs = useAttrs();
const machine = computed(() => getPopoverProps({ id: ctx.id, open: ctx.open.value }, ctx.send).anchor);
const bound = computed(() => mergeProps(themeAttrs.value.anchor, attrs, { ...machine.value }));

const live = liveElementRef();
// The `reference` wins over the element of the anchor.
const target = computed<Element | OverlayVirtualAnchor | null>(() => props.reference ?? live.element.value);

function setAnchor(instance: unknown): void {
  live.follow(instance as ComponentPublicInstance | null);
}

// The last anchor mounted is the one the content uses; an anchor that was replaced leaves the registration alone.
let registered: Element | OverlayVirtualAnchor | null = null;
onMounted(() => {
  watch(
    target,
    (next, previous) => {
      if (previous !== undefined && ctx.anchor.value !== registered) return;
      registered = next;
      ctx.anchor.value = next;
    },
    { immediate: true, flush: 'post' },
  );
});
onBeforeUnmount(() => {
  if (ctx.anchor.value === registered) ctx.anchor.value = null;
});
</script>

<template>
  <Primitive :ref="setAnchor" v-bind="bound" :as="as" :as-child="asChild">
    <slot />
  </Primitive>
</template>
