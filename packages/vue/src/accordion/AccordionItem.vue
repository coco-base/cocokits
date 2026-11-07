<script setup lang="ts">
import { computed, mergeProps, onBeforeUnmount, onMounted, onUpdated, provide, shallowRef, useAttrs, useId } from 'vue';
import { createPresence, type PresenceState } from '@cocokits/cdk/presence';
import { accordionAnatomy, getAccordionItemProps } from '@cocokits/machines/accordion';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { ACCORDION_ITEM_KEY, useAccordionContext } from './accordion.context';
import type { AccordionItemProps } from './accordion.types';

defineOptions({ name: 'CckAccordionItem', inheritAttrs: false });

const props = withDefaults(defineProps<AccordionItemProps>(), {
  disabled: false,
  unmountOnHide: undefined,
  as: 'div',
  asChild: false,
});
defineSlots<{
  /** The header and the content of the item. It receives `open`. */
  default?(props: {
    /**
     * Whether the item is open.
     *
     * @cckSemantic none
     * @cckParity Slot prop.
     */
    open: boolean;
  }): unknown;
}>();

const ctx = useAccordionContext('AccordionItem');
const themeAttrs = useThemeAttrs(accordionAnatomy);
const attrs = useAttrs();
const id = useId();
const trigger = shallowRef<HTMLElement | null>(null);
const content = shallowRef<HTMLElement | null>(null);
const open = computed(() => ctx.state.value.value.includes(props.value));
// The exit animation keeps the content shown after the item has closed. It starts when the closed state is rendered.
const presenceState = shallowRef<PresenceState>('unmounted');
const shown = computed(() => open.value || presenceState.value !== 'unmounted');
const presence = createPresence({
  getElement: () => content.value,
  onStateChange: (next) => {
    presenceState.value = next;
  },
});

provide(ACCORDION_ITEM_KEY, {
  value: computed(() => props.value),
  id,
  disabled: computed(() => props.disabled),
  open,
  shown,
  unmountOnHide: computed(() => props.unmountOnHide ?? ctx.unmountOnHide.value),
  trigger,
  content,
  presence,
});

const machine = computed(() =>
  getAccordionItemProps(
    ctx.state.value,
    { id, key: props.value, disabled: props.disabled, contentPresent: shown.value },
    ctx.dispatch,
  ),
);
const bound = computed(() => mergeProps(themeAttrs.value.item, attrs, { ...machine.value.item }));

let unregister: (() => void) | undefined;
onMounted(() => {
  unregister = ctx.register({
    value: () => props.value,
    disabled: () => props.disabled,
    trigger: () => trigger.value,
    content: () => content.value,
  });
});
onUpdated(ctx.refresh);
onBeforeUnmount(() => {
  unregister?.();
  unregister = undefined;
  presence.destroy();
});
</script>

<template>
  <Primitive
    v-bind="bound"
    :as="as"
    :as-child="asChild"
    :priority-attrs="['data-state', 'data-disabled', 'data-orientation']"
  >
    <slot :open="open" />
  </Primitive>
</template>
