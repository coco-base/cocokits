<script setup lang="ts">
import {
  computed,
  mergeProps,
  nextTick,
  onBeforeUnmount,
  onMounted,
  useAttrs,
  useId,
  watch,
  watchEffect,
  type ComponentPublicInstance,
} from 'vue';
import { deepActiveElement } from '@cocokits/cdk/focus';
import { getMenuProps, menuAnatomy, type MenuEvent } from '@cocokits/machines/menu';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { vueProps } from './menu-props';
import { useMenuSubContext } from './menu.context';
import type { MenuSubTriggerProps } from './menu-sub.types';

defineOptions({ name: 'CckMenuSubTrigger', inheritAttrs: false });

const props = withDefaults(defineProps<MenuSubTriggerProps>(), { disabled: false, as: 'div', asChild: false });
defineSlots<{
  /**
   * The content of the sub-trigger: text, and an icon if you like. The text is what typing finds. When not set, the
   * sub-trigger shows no text.
   *
   * @example
   * <MenuSubTrigger>Share</MenuSubTrigger>
   */
  default?(): unknown;
}>();

const sub = useMenuSubContext('MenuSubTrigger');
const { parent, menu } = sub;
const themeAttrs = useThemeAttrs(menuAnatomy);
const attrs = useAttrs();
const key = useId();
const authoredId = computed(() => (typeof attrs.id === 'string' ? attrs.id : undefined));

/** The events about the submenu go to it; the others are the parent menu's, as for any item. */
function send(event: MenuEvent): void {
  // The pointer on this item closes the submenus of its siblings.
  if (event.type === 'SUB.TRIGGER.POINTER_MOVE') parent.pointerMoved(key, event.event);
  (event.type.startsWith('SUB.') ? menu.send : parent.send)(event);
}

const machine = computed(() =>
  getMenuProps(parent.state.value, send).subTrigger(
    { key, text: '', disabled: props.disabled },
    { id: menu.id, open: menu.open.value, mounted: menu.mounted.value, triggerId: authoredId.value },
  ),
);
const bound = computed(() => mergeProps(themeAttrs.value.subTrigger, attrs, vueProps(machine.value)));
// The machine's attributes win over an `asChild` child's own props.
const priorityAttrs = computed(() => Object.keys(vueProps(machine.value)).filter((name) => name !== 'class'));

// The submenu is labelled by the id the author gave the sub-trigger, and needs to know whether it may open.
watchEffect(
  () => {
    menu.triggerId.value = authoredId.value;
    sub.triggerDisabled.value = props.disabled;
  },
  { flush: 'sync' },
);

// A function ref hands over the instance; the element is read from it on every use.
function setTrigger(instance: unknown): void {
  menu.followTrigger(instance as ComponentPublicInstance | null);
}

// The sub-trigger is an item of the parent menu: the arrow keys and typing reach it. Registers once per key (again
// when the element or the disabled fact changes).
let unregister: (() => void) | undefined;
function register(): void {
  const element = menu.triggerElement.value;
  if (!element) return;
  sub.triggerKey.value = key;
  unregister = parent.registerItem({
    key,
    element,
    disabled: props.disabled,
    kind: 'item',
    checked: undefined,
    value: undefined,
    hasDescription: false,
    change: () => undefined,
  });
}
onMounted(register);
watch([() => props.disabled, menu.triggerElement], register, { flush: 'post' });
onBeforeUnmount(() => {
  const node = menu.triggerElement.value;
  const hadFocus = node !== null && deepActiveElement(node.ownerDocument) === node;
  unregister?.();
  menu.triggerId.value = undefined;
  sub.triggerKey.value = undefined;
  if (!hadFocus) return;
  void nextTick(() => {
    if (parent.open.value) parent.contentElement.value?.focus();
  });
});
</script>

<template>
  <Primitive :ref="setTrigger" v-bind="bound" :as="as" :as-child="asChild" :priority-attrs="priorityAttrs">
    <slot />
  </Primitive>
</template>
