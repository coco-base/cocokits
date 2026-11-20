<script setup lang="ts">
import { computed, mergeProps, onBeforeUnmount, useAttrs, watchEffect, type ComponentPublicInstance } from 'vue';
import { getMenuProps, menuAnatomy } from '@cocokits/machines/menu';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { useUnnamedWarning } from '../internal/use-unnamed-warning';
import { vueProps } from './menu-props';
import { useMenuContext } from './menu.context';
import type { MenuTriggerProps } from './menu.types';

defineOptions({ name: 'CckMenuTrigger', inheritAttrs: false });

withDefaults(defineProps<MenuTriggerProps>(), { as: 'button', asChild: false });
defineSlots<{
  /**
   * The content of the trigger: text and icons. An icon-only trigger needs `aria-label`. When not set, the trigger
   * is empty and needs `aria-label`.
   *
   * @example
   * <MenuTrigger aria-label="More actions"><SvgIcon icon-name="more" /></MenuTrigger>
   */
  default?(): unknown;
}>();

const ctx = useMenuContext('MenuTrigger');
const themeAttrs = useThemeAttrs(menuAnatomy);
const attrs = useAttrs();
const authoredId = computed(() => (typeof attrs.id === 'string' ? attrs.id : undefined));
const machine = computed(() => getMenuProps({ ...ctx.state.value, triggerId: authoredId.value }, ctx.send).trigger);
const bound = computed(() => mergeProps(themeAttrs.value.trigger, attrs, vueProps(machine.value)));
// The state markers win over an `asChild` child's own props; its own `id` stays, like one on the part.
const priorityAttrs = ['type', 'aria-haspopup', 'aria-expanded', 'aria-controls', 'data-state'];

// The content is labelled by the id the author gave the trigger; the machine derives the rest.
watchEffect(
  () => {
    ctx.triggerId.value = authoredId.value;
  },
  { flush: 'sync' },
);
onBeforeUnmount(() => {
  ctx.triggerId.value = undefined;
});
useUnnamedWarning('MenuTrigger', ctx.triggerElement, {
  fix: 'The menu takes its name from it. Put text inside it, or add an aria-label or an aria-labelledby that points to an element with text.',
});

// A function ref hands over the instance; the element is read from it on every use, so it follows an
// `asChild` child that swaps its own root. Vue calls it with `null` on unmount.
function setTrigger(instance: unknown): void {
  ctx.followTrigger(instance as ComponentPublicInstance | null);
}
</script>

<template>
  <Primitive :ref="setTrigger" v-bind="bound" :as="as" :as-child="asChild" :priority-attrs="priorityAttrs">
    <slot />
  </Primitive>
</template>
