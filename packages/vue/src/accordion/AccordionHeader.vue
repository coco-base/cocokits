<script setup lang="ts">
import { computed, mergeProps, useAttrs } from 'vue';
import { accordionAnatomy, getAccordionItemProps } from '@cocokits/machines/accordion';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { useAccordionContext, useAccordionItemContext } from './accordion.context';
import type { AccordionHeaderProps } from './accordion.types';

defineOptions({ name: 'CckAccordionHeader', inheritAttrs: false });

withDefaults(defineProps<AccordionHeaderProps>(), { as: 'h3', asChild: false });
defineSlots<{
  /**
   * The trigger of the item. When not set, the heading is empty and the item cannot be opened by the user.
   *
   * @example
   * <AccordionHeader><AccordionTrigger>Shipping</AccordionTrigger></AccordionHeader>
   */
  default?(): unknown;
}>();

const ctx = useAccordionContext('AccordionHeader');
const item = useAccordionItemContext('AccordionHeader');
const themeAttrs = useThemeAttrs(accordionAnatomy);
const attrs = useAttrs();
const machine = computed(
  () =>
    getAccordionItemProps(
      ctx.state.value,
      { id: item.id, key: item.value.value, disabled: item.disabled.value },
      ctx.dispatch,
    ).header,
);
const bound = computed(() => mergeProps(themeAttrs.value.header, attrs, { ...machine.value }));
</script>

<template>
  <Primitive
    v-bind="bound"
    :as="as"
    :as-child="asChild"
    :priority-attrs="['data-state', 'data-disabled', 'data-orientation']"
  >
    <slot />
  </Primitive>
</template>
