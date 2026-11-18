<script setup lang="ts">
import {
  computed,
  mergeProps,
  onBeforeUnmount,
  onMounted,
  useAttrs,
  useTemplateRef,
  type ComponentPublicInstance,
} from 'vue';
import { selectAnatomy } from '@cocokits/machines/select';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { toVueListeners } from '../internal/listeners';
import { omit } from '../internal/record';
import { rootElementOf } from '../internal/root-element';
import { useSelectContext } from './select.context';
import type { SelectSearchProps } from './select-parts.types';

defineOptions({ name: 'CckSelectSearch', inheritAttrs: false });

const props = withDefaults(defineProps<SelectSearchProps>(), {
  ariaLabel: 'Search',
  placeholder: undefined,
});

const ctx = useSelectContext<unknown>('SelectSearch');
const themeAttrs = useThemeAttrs(selectAnatomy);
const attrs = useAttrs();
const root = useTemplateRef<ComponentPublicInstance>('root');

/**
 * Escape is the list's: its dismiss layer answers it, so the content emits can refuse it. Tab leaves the search first
 * and the trigger takes the focus, so the browser moves on from the trigger as it does without a list.
 */
function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') return;
  if (event.key === 'Tab' && !event.defaultPrevented) ctx.focusTrigger();
  ctx.parts.value.search.onKeyDown(event);
}

// The machine's attributes are reserved, except the name: the author's `aria-label` renames the search. The press
// in the box keeps its default, so the caret and the selection work.
const bound = computed(() => {
  const machine = ctx.parts.value.search;
  return mergeProps(
    themeAttrs.value.search,
    omit(
      attrs,
      'role',
      'type',
      'value',
      'aria-expanded',
      'aria-controls',
      'aria-autocomplete',
      'aria-activedescendant',
    ),
    omit(toVueListeners(machine), 'onKeydown'),
    {
      'aria-label': props.ariaLabel,
      placeholder: props.placeholder,
      onKeydown,
      onMousedown: (event: MouseEvent) => {
        event.stopPropagation();
      },
    },
  );
});
const priorityAttrs = ['type', 'role', 'aria-expanded', 'aria-controls', 'aria-autocomplete', 'aria-activedescendant'];

// The Root moves the focus here when the list opens.
onMounted(() => {
  ctx.searchElement.value = rootElementOf(root.value) as HTMLElement | null;
});
onBeforeUnmount(() => {
  ctx.searchElement.value = null;
});
</script>

<template>
  <Primitive ref="root" v-bind="bound" as="input" :priority-attrs="priorityAttrs" />
</template>
