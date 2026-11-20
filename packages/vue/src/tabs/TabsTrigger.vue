<script setup lang="ts">
import {
  computed,
  h,
  mergeProps,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  useAttrs,
  useTemplateRef,
  type ComponentPublicInstance,
  type VNode,
} from 'vue';
import { getTabsProps, tabsAnatomy } from '@cocokits/machines/tabs';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { buttonPartKind } from '../internal/button-part';
import { toVueListeners } from '../internal/listeners';
import { omit } from '../internal/record';
import { rootElementOf } from '../internal/root-element';
import { useTabsContext } from './tabs.context';
import type { TabsTriggerProps } from './tabs.types';

defineOptions({ name: 'CckTabsTrigger', inheritAttrs: false });

const props = withDefaults(defineProps<TabsTriggerProps>(), { disabled: false, as: 'button', asChild: false });
defineSlots<{
  /**
   * The label of the trigger: text and icons. When not set, the trigger has no accessible name.
   *
   * @example
   * <TabsTrigger value="account">Account</TabsTrigger>
   *
   * @cckSemantic tabs.label
   * @cckParity The label is the content of the trigger part.
   */
  default?(): unknown;
}>();

const ctx = useTabsContext('TabsTrigger');
ctx.claimInitial(props.value, props.disabled);
const themeAttrs = useThemeAttrs(tabsAnatomy);
const attrs = useAttrs();
const parts = computed(() => getTabsProps(ctx.state.value, ctx.dispatch));
const kind = computed(() => buttonPartKind(props.as, props.asChild));
const machine = computed(() => {
  const trigger = toVueListeners(parts.value.trigger({ value: props.value, disabled: props.disabled }));
  if (kind.value === 'native') return trigger;
  // Only a native button gets `type`. Another element gets `aria-disabled` where a button gets `disabled`.
  if (kind.value === 'child') return omit(trigger, 'type');
  return { ...omit(trigger, 'type', 'disabled'), 'aria-disabled': props.disabled ? 'true' : undefined };
});

// Enter and Space select the tab on keydown, as they do on a button; a consumer listener runs first and may veto.
function onActivate(event: KeyboardEvent): void {
  if (kind.value !== 'non-native' || event.defaultPrevented || event.target !== event.currentTarget) return;
  if (event.key !== 'Enter' && event.key !== ' ') return;
  // A disabled tab selects nothing, but Space still must not scroll the page.
  event.preventDefault();
  if (!props.disabled) ctx.dispatch({ type: 'TRIGGER.CLICK', value: props.value, event });
}
// A consumer listener runs first (`mergeProps` chains it before ours); the machine skips a vetoed click.
const bound = computed(() =>
  mergeProps(
    themeAttrs.value.trigger,
    attrs,
    {
      onFocus: () => {
        ctx.focusTrigger(props.value);
      },
      onBlur: () => {
        ctx.blurTrigger();
      },
    },
    { ...machine.value },
    { onKeydown: onActivate },
  ),
);
const labelProps = computed(() => mergeProps(themeAttrs.value.triggerLabel, { ...parts.value.triggerLabel }));
// The state markers win over an `asChild` child's own props.
const priorityAttrs = [
  'id',
  'role',
  'aria-selected',
  'aria-controls',
  'tabindex',
  'tabIndex',
  'data-orientation',
  'data-selected',
  'data-disabled',
  'data-focus-visible',
];

// With `asChild` the child's own children go inside the label.
function inLabel(hostChildren?: VNode[]): VNode[] {
  return [h('span', labelProps.value, hostChildren)];
}

const root = useTemplateRef<ComponentPublicInstance>('root');
const element = (): HTMLElement | null => rootElementOf(root.value) as HTMLElement | null;
let unregister: (() => void) | undefined;
onMounted(() => {
  unregister = ctx.register({ value: () => props.value, disabled: () => props.disabled, element });
});
onUpdated(ctx.refresh);
onBeforeUnmount(() => {
  unregister?.();
  unregister = undefined;
});
</script>

<template>
  <Primitive
    ref="root"
    v-bind="bound"
    :as="as"
    :as-child="asChild"
    :priority-attrs="priorityAttrs"
    :as-child-content="inLabel"
  >
    <span v-if="!asChild" v-bind="labelProps"><slot /></span>
    <slot v-else />
  </Primitive>
</template>
