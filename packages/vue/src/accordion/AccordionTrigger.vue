<script setup lang="ts">
import {
  computed,
  mergeProps,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  h,
  useAttrs,
  useSlots,
  useTemplateRef,
  type ComponentPublicInstance,
  type VNode,
} from 'vue';
import { accordionAnatomy, getAccordionItemProps } from '@cocokits/machines/accordion';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { buttonPartKind, NON_NATIVE_DEFAULTS, nonNativePress, typedForKind } from '../internal/button-part';
import { toVueListeners } from '../internal/listeners';
import { omit } from '../internal/record';
import { Nodes } from '../internal/own-content';
import { usePartIcon } from '../internal/use-part-icon';
import { rootElementOf } from '../internal/root-element';
import { SvgIcon } from '../svg-icon';
import { useAccordionContext, useAccordionItemContext } from './accordion.context';
import type { AccordionTriggerProps } from './accordion.types';

defineOptions({ name: 'CckAccordionTrigger', inheritAttrs: false });

const props = withDefaults(defineProps<AccordionTriggerProps>(), { as: 'button', asChild: false });
defineSlots<{
  /**
   * The label of the trigger: text and icons. When not set, the trigger has no accessible name. The indicator follows
   * it as the last child of the trigger.
   *
   * @example
   * <AccordionTrigger>Shipping</AccordionTrigger>
   *
   * @cckSemantic accordion.label
   * @cckParity The label is the content of the trigger part.
   */
  default?(): unknown;
}>();

const ctx = useAccordionContext('AccordionTrigger');
const item = useAccordionItemContext('AccordionTrigger');
const themeAttrs = useThemeAttrs(accordionAnatomy);
const attrs = useAttrs();
const slots = useSlots();
const iconName = usePartIcon(accordionAnatomy.block, 'indicator');
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

/** The element that renders the trigger is the child of `asChild` or of `as="template"`. */
const isChild = computed(() => props.asChild || props.as === 'template');
/** The indicator part: always rendered, decorative, holding the icon of the part (the theme's, else `chevron-down`). */
function indicator(): VNode {
  return h('span', { ...themeAttrs.value.indicator, ...parts.value.indicator }, [
    h(SvgIcon, { iconName: iconName.value }),
  ]);
}
/** With `asChild` the indicator goes after the children of the child, so it stays the last child of the trigger. */
const withIndicator = (hostChildren: VNode[] = []): VNode[] => [...hostChildren, indicator()];

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
  <Primitive
    ref="root"
    v-bind="bound"
    :as="as"
    :as-child="asChild"
    :priority-attrs="priorityAttrs"
    :as-child-content="withIndicator"
  >
    <slot v-if="isChild" />
    <Nodes v-else :nodes="withIndicator(slots.default?.())" />
  </Primitive>
</template>
