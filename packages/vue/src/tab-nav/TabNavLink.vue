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
import { getTabNavProps, tabNavAnatomy } from '@cocokits/machines/tab-nav';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { rootElementOf } from '../internal/root-element';
import { useTabNavContext } from './tab-nav.context';
import type { TabNavLinkProps } from './tab-nav.types';

defineOptions({ name: 'CckTabNavLink', inheritAttrs: false });

const props = withDefaults(defineProps<TabNavLinkProps>(), { active: false, disabled: false, as: 'a', asChild: false });
defineSlots<{
  /**
   * The text of the link, with an icon if you like. When not set, the link has no accessible name.
   *
   * @example
   * <TabNavLink href="/profile"><UserIcon aria-hidden="true" /> Profile</TabNavLink>
   */
  default?(): unknown;
}>();

const ctx = useTabNavContext('TabNavLink');
const themeAttrs = useThemeAttrs(tabNavAnatomy);
const attrs = useAttrs();
const key = Symbol('cck-tab-nav-link');
const panelMode = computed(() => ctx.panelId.value !== undefined);
const machine = computed(() => {
  // Before mount the root has no list of links: the Tab stop is claimed in setup order (server and first render).
  const tabStop =
    panelMode.value &&
    (ctx.stop.value === undefined ? ctx.claim(key, props.active, props.disabled) : ctx.stop.value === key);
  const { id: attrId } = attrs;
  const id = typeof attrId === 'string' ? attrId : undefined;
  const { onClick, ...rest } = getTabNavProps({ panelId: ctx.panelId.value }).link({
    active: props.active,
    disabled: props.disabled,
    id,
    tabStop,
  });
  return { onClick, rest };
});
// The state markers win over an `asChild` child's own props (a router link sets its own `aria-current`).
const priorityAttrs = [
  'id',
  'role',
  'aria-current',
  'aria-selected',
  'aria-controls',
  'aria-disabled',
  'tabindex',
  'tabIndex',
  'data-active',
  'data-disabled',
];
// In link mode the author's `id` stays the element's own; in panel mode the machine decides it.
const bound = computed(() => mergeProps(themeAttrs.value.link, attrs, { ...machine.value.rest }, { onKeydown }));

// Bound with `@click.capture` after the attrs, so a consumer `@click.capture` runs first and may veto.
function guard(event: MouseEvent): void {
  machine.value.onClick?.(event);
}

// Space activates a tab link and must not scroll the page; a button does that natively.
function onKeydown(event: KeyboardEvent): void {
  const element = event.currentTarget as HTMLElement | null;
  if (!panelMode.value || !element || event.defaultPrevented) return;
  if (event.key !== ' ' || event.target !== element || element.tagName === 'BUTTON') return;
  event.preventDefault();
  if (!props.disabled) element.click();
}

const root = useTemplateRef<ComponentPublicInstance>('root');
const element = (): HTMLElement | null => rootElementOf(root.value) as HTMLElement | null;
let unregister: (() => void) | undefined;
onMounted(() => {
  unregister = ctx.register({ key, active: () => props.active, disabled: () => props.disabled, element });
});
// A change of `active` or `disabled` renders only this link, so the root lists the links again.
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
    @click.capture="guard"
  >
    <slot />
  </Primitive>
</template>
