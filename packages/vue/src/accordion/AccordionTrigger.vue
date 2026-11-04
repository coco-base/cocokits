<script setup lang="ts">
import {
  computed,
  mergeProps,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  useAttrs,
  useTemplateRef,
  type ComponentPublicInstance,
} from 'vue';
import { accordionAnatomy, getAccordionItemProps } from '@cocokits/machines/accordion';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { buttonPartKind, NON_NATIVE_DEFAULTS, nonNativePress, typedForKind } from '../internal/button-part';
import { toVueListeners } from '../internal/listeners';
import { omit } from '../internal/record';
import { rootElementOf } from '../internal/root-element';
import { useAccordionContext, useAccordionItemContext } from './accordion.context';
import type { AccordionTriggerProps } from './accordion.types';

defineOptions({ name: 'CckAccordionTrigger', inheritAttrs: false });

const props = withDefaults(defineProps<AccordionTriggerProps>(), { as: 'button', asChild: false });
defineSlots<{
  /**
   * The label of the trigger: text and icons.
   *
   * @cckSemantic accordion.label
   * @remarks Angular takes the label as `label` or as a `cckAccordionLabel` template on the item.
   */
  default?(): unknown;
}>();

const ctx = useAccordionContext('AccordionTrigger');
const item = useAccordionItemContext('AccordionTrigger');
const themeAttrs = useThemeAttrs(accordionAnatomy);
const attrs = useAttrs();
const kind = computed(() => buttonPartKind(props.as, props.asChild));
const parts = computed(() =>
  getAccordionItemProps(
    ctx.state.value,
    { id: item.id, key: item.value.value, disabled: item.disabled.value },
    ctx.dispatch,
  ),
);
const machine = computed(() => {
  const trigger = toVueListeners(typedForKind(kind.value, parts.value.trigger));
  if (kind.value !== 'non-native') return trigger;
  // Another element gets `aria-disabled` where a button gets `disabled`.
  const disabled = parts.value.trigger.disabled === true;
  // A disabled one also leaves the Tab sequence; the default `tabindex` of a non-native part is 0.
  return {
    ...omit(trigger, 'disabled'),
    'aria-disabled': disabled ? 'true' : parts.value.trigger['aria-disabled'],
    ...(disabled ? { tabindex: -1 } : {}),
  };
});
// A consumer listener runs first (`mergeProps` chains it before ours); the machine skips a vetoed click.
const bound = computed(() =>
  mergeProps(
    themeAttrs.value.trigger,
    kind.value === 'non-native' ? NON_NATIVE_DEFAULTS : {},
    attrs,
    {
      onFocus: () => {
        ctx.focusTrigger(item.value.value);
      },
      onBlur: () => {
        ctx.blurTrigger();
      },
    },
    { ...machine.value },
    kind.value === 'non-native' ? nonNativePress() : {},
  ),
);
// The state markers win over an `asChild` child's own props.
const priorityAttrs = [
  'id',
  'aria-expanded',
  'aria-controls',
  'aria-disabled',
  'data-state',
  'data-disabled',
  'data-orientation',
  'data-focus-visible',
];

const root = useTemplateRef<ComponentPublicInstance>('root');
const sync = (): void => {
  item.trigger.value = rootElementOf(root.value) as HTMLElement | null;
};
onMounted(sync);
onUpdated(sync);
onBeforeUnmount(() => {
  item.trigger.value = null;
});
</script>

<template>
  <Primitive ref="root" v-bind="bound" :as="as" :as-child="asChild" :priority-attrs="priorityAttrs">
    <slot />
  </Primitive>
</template>
