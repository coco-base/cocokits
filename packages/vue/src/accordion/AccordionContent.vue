<script setup lang="ts">
import {
  computed,
  mergeProps,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  useAttrs,
  useTemplateRef,
  watch,
  type ComponentPublicInstance,
} from 'vue';
import { writeContentSize } from '@cocokits/cdk/content-size';
import { accordionAnatomy, accordionContentSizeVariables, getAccordionItemProps } from '@cocokits/machines/accordion';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { rootElementOf } from '../internal/root-element';
import { useAccordionContext, useAccordionItemContext } from './accordion.context';
import type { AccordionContentProps } from './accordion.types';

defineOptions({ name: 'CckAccordionContent', inheritAttrs: false });

const props = withDefaults(defineProps<AccordionContentProps>(), { forceMount: false, as: 'div', asChild: false });
defineSlots<{
  /** The body of the section. */
  default?(): unknown;
}>();

const ctx = useAccordionContext('AccordionContent');
const item = useAccordionItemContext('AccordionContent');
const themeAttrs = useThemeAttrs(accordionAnatomy);
const attrs = useAttrs();
const machine = computed(
  () =>
    getAccordionItemProps(
      ctx.state.value,
      { id: item.id, key: item.value.value, disabled: item.disabled.value, contentPresent: item.shown.value },
      ctx.dispatch,
    ).content,
);
const bound = computed(() => mergeProps(themeAttrs.value.content, attrs, { ...machine.value }));
// The children go while the content is hidden, unless the author keeps them.
const renderChildren = computed(() => props.forceMount || !item.unmountOnHide.value || item.shown.value);
const priorityAttrs = ['id', 'role', 'aria-labelledby', 'hidden', 'data-state', 'data-disabled', 'data-orientation'];

const root = useTemplateRef<ComponentPublicInstance>('root');
const sync = (): void => {
  item.content.value = rootElementOf(root.value) as HTMLElement | null;
};

onMounted(() => {
  sync();
  // An item that is open at first render shows at full height: no size is written and nothing animates.
  if (item.open.value) item.presence.setOpen(true);
});
onUpdated(sync);
onBeforeUnmount(() => {
  item.content.value = null;
});

// After the render of the changed state: opening has rendered the content, closing still shows it. The size is written
// then, and the exit waits for the animation that the closed state started.
watch(
  item.open,
  (open) => {
    const element = item.content.value;
    if (element) writeContentSize(element, accordionContentSizeVariables);
    item.presence.setOpen(open);
  },
  { flush: 'post' },
);
</script>

<template>
  <Primitive v-bind="bound" ref="root" :as="as" :as-child="asChild" :priority-attrs="priorityAttrs">
    <slot v-if="renderChildren || asChild" />
  </Primitive>
</template>
