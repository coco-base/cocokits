<script setup lang="ts">
import { computed, mergeProps, useAttrs, useTemplateRef, watch, type ComponentPublicInstance } from 'vue';
import { scrollItemIntoList } from '@cocokits/cdk/active-indicator';
import { createRovingFocus } from '@cocokits/cdk/roving-focus';
import { getTabsProps, tabsAnatomy } from '@cocokits/machines/tabs';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { rootElementOf } from '../internal/root-element';
import { useTabsContext } from './tabs.context';
import type { TabsListProps } from './tabs.types';

defineOptions({ name: 'CckTabsList', inheritAttrs: false });

const props = withDefaults(defineProps<TabsListProps>(), { loop: true, as: 'div', asChild: false });
defineSlots<{
  /** The triggers and the `TabsIndicator`. */
  default?(): unknown;
}>();

const ctx = useTabsContext('TabsList');
const themeAttrs = useThemeAttrs(tabsAnatomy);
const attrs = useAttrs();
const root = useTemplateRef<ComponentPublicInstance>('root');
const listElement = (): HTMLElement | null => rootElementOf(root.value) as HTMLElement | null;

// The arrow keys, Home and End move focus between the enabled triggers; the machine decides whether the move also
// selects. A new instance is made when a setting changes.
const roving = computed(() =>
  createRovingFocus({
    getItems: () =>
      ctx.getEntries().flatMap((entry) => {
        const element = entry.element();
        return element ? [{ element, disabled: entry.disabled() }] : [];
      }),
    strategy: 'focus',
    orientation: ctx.orientation.value,
    loop: props.loop,
    getDirection: () => ctx.state.value.dir ?? 'ltr',
    // The key target is always a trigger, which gives the current index.
    getCurrentIndex: () => -1,
    onActiveChange: (index, { event }) => {
      const entry = ctx.getEntries().at(index);
      if (!entry) return;
      const list = listElement();
      const element = entry.element();
      if (list && element) scrollItemIntoList(list, element);
      ctx.dispatch({ type: 'TRIGGER.NAVIGATE', value: entry.value(), event });
    },
  }),
);

// Shift+arrow is the browser's or the page's (a selection, a gesture): not a tab move (Radix).
function onKeydown(event: KeyboardEvent): void {
  if (!event.shiftKey) roving.value.handleKeyDown(event);
}

// A selection after the first one brings the selected tab fully into view; only the list scrolls.
watch(
  ctx.selected,
  (next, previous) => {
    if (previous === undefined || next === undefined) return;
    const list = listElement();
    const trigger = ctx.getTrigger(next);
    if (list && trigger) scrollItemIntoList(list, trigger);
  },
  { flush: 'post' },
);

const machine = computed(() => getTabsProps(ctx.state.value, ctx.dispatch));
const bound = computed(() => mergeProps(themeAttrs.value.list, attrs, { ...machine.value.list }, { onKeydown }));
const priorityAttrs = ['role', 'aria-orientation', 'data-orientation'];
</script>

<template>
  <Primitive ref="root" v-bind="bound" :as="as" :as-child="asChild" :priority-attrs="priorityAttrs">
    <slot />
  </Primitive>
</template>
