<script setup lang="ts">
import { computed, mergeProps, useAttrs, useTemplateRef, type ComponentPublicInstance } from 'vue';
import { scrollItemIntoList } from '@cocokits/cdk/active-indicator';
import { createRovingFocus } from '@cocokits/cdk/roving-focus';
import { getTabNavProps, tabNavAnatomy } from '@cocokits/machines/tab-nav';
import { Primitive, useDirection, useThemeAttrs } from '@cocokits/vue-core';
import { rootElementOf } from '../internal/root-element';
import { useTabNavContext } from './tab-nav.context';
import type { TabNavListProps } from './tab-nav.types';

defineOptions({ name: 'CckTabNavList', inheritAttrs: false });

withDefaults(defineProps<TabNavListProps>(), { as: 'div', asChild: false });
defineSlots<{
  /** The `TabNavLink`s and the `TabNavIndicator`. */
  default?(): unknown;
}>();

const ctx = useTabNavContext('TabNavList');
const themeAttrs = useThemeAttrs(tabNavAnatomy);
const attrs = useAttrs();
const direction = useDirection();
const root = useTemplateRef<ComponentPublicInstance>('root');
const listElement = (): HTMLElement | null => rootElementOf(root.value) as HTMLElement | null;

// Panel mode only: the arrow keys, Home and End move focus between the enabled links and never navigate.
const roving = computed(() =>
  createRovingFocus({
    getItems: () =>
      ctx.getEntries().flatMap((entry) => {
        const element = entry.element();
        return element ? [{ element, disabled: entry.disabled() }] : [];
      }),
    strategy: 'focus',
    orientation: 'horizontal',
    loop: true,
    getDirection: () => direction.value,
    // The key target is always a link, which gives the current index.
    getCurrentIndex: () => -1,
    onActiveChange: (index) => {
      const list = listElement();
      const element = ctx.getEntries().at(index)?.element();
      if (list && element) scrollItemIntoList(list, element);
    },
  }),
);

// Shift+arrow is the browser's or the page's: not a link move.
function onKeydown(event: KeyboardEvent): void {
  if (ctx.panelId.value !== undefined && !event.shiftKey) roving.value.handleKeyDown(event);
}

const machine = computed(() => getTabNavProps({ panelId: ctx.panelId.value }).list);
const bound = computed(() => mergeProps(themeAttrs.value.list, attrs, { ...machine.value }, { onKeydown }));
const priorityAttrs = ['role'];
</script>

<template>
  <Primitive ref="root" v-bind="bound" :as="as" :as-child="asChild" :priority-attrs="priorityAttrs">
    <slot />
  </Primitive>
</template>
