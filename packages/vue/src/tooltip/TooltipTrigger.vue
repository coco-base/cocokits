<script setup lang="ts">
import {
  computed,
  mergeProps,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  useAttrs,
  watch,
  type ComponentPublicInstance,
} from 'vue';
import { getTooltipProps, tooltipAnatomy } from '@cocokits/machines/tooltip';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { buttonPartKind } from '../internal/button-part';
import { idOf } from '../internal/id-of';
import { toVueListeners } from '../internal/listeners';
import { useTooltipContext } from './tooltip.context';
import type { TooltipTriggerProps } from './tooltip.types';

defineOptions({ name: 'CckTooltipTrigger', inheritAttrs: false });

const props = withDefaults(defineProps<TooltipTriggerProps>(), { reference: undefined, as: 'button', asChild: false });
defineSlots<{
  /** The content of the trigger: text and icons. An icon-only trigger needs `aria-label`. */
  default?(): unknown;
}>();

const ctx = useTooltipContext('TooltipTrigger');
const themeAttrs = useThemeAttrs(tooltipAnatomy);
const attrs = useAttrs();
const machine = computed(
  () =>
    getTooltipProps(
      {
        id: ctx.id,
        open: ctx.open.value,
        mounted: ctx.mounted.value,
        description: ctx.description.value,
        disabled: ctx.disabled.value,
        isFocusVisible: ctx.isFocusVisible,
      },
      ctx.send,
    ).trigger,
);
// The tooltip adds its content id to the description the author wrote.
const describedBy = computed(
  () => [attrs['aria-describedby'], machine.value['aria-describedby']].filter(Boolean).join(' ') || undefined,
);
// A consumer listener runs first (`mergeProps` chains it before ours).
// A native `button` never submits a form. An element that is not a button is a tab stop, so focus shows the
// tooltip; an `asChild` child keeps its own semantics.
const kind = computed(() => buttonPartKind(props.as, props.asChild));
const bound = computed(() => {
  const { id } = attrs;
  const rest = toVueListeners(machine.value);
  return mergeProps(
    themeAttrs.value.trigger,
    kind.value === 'non-native' ? { tabindex: 0 } : {},
    attrs,
    {
      ...(kind.value === 'native' ? { type: 'button' } : {}),
      ...rest,
      id: idOf(id, machine.value.id),
    },
    { 'aria-describedby': describedBy.value },
  );
});
// The state markers win over an `asChild` child's own props.
const priorityAttrs = ['aria-describedby', 'data-state'];

// A description equal to this label adds nothing, so the root needs to know it. Read from the attributes, not
// from the element, so an `asChild` child's own label counts after the merge.
function reportLabel(): void {
  const label = ctx.triggerElement.value?.getAttribute('aria-label');
  ctx.triggerLabel.value = label ?? undefined;
}
onMounted(reportLabel);
onUpdated(reportLabel);

// The content is placed against the `reference` when there is one. Set after mount: the server needs no anchor.
onMounted(() => {
  watch(
    () => props.reference,
    (reference) => {
      ctx.reference.value = reference ?? null;
    },
    { immediate: true, flush: 'post' },
  );
});
onBeforeUnmount(() => {
  ctx.reference.value = null;
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
