<script setup lang="ts">
import {
  computed,
  mergeProps,
  nextTick,
  onBeforeUnmount,
  onMounted,
  useAttrs,
  useId,
  useTemplateRef,
  watch,
  type ComponentPublicInstance,
} from 'vue';
import { deepActiveElement } from '@cocokits/cdk/focus';
import { getMenuProps, menuAnatomy } from '@cocokits/machines/menu';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { omit } from '../internal/record';
import { rootElementOf } from '../internal/root-element';
import { vueProps } from './menu-props';
import { useMenuContext } from './menu.context';
import type { MenuItemEmits, MenuItemProps } from './menu.types';

defineOptions({ name: 'CckMenuItem', inheritAttrs: false });

const props = withDefaults(defineProps<MenuItemProps>(), { disabled: false, as: 'div', asChild: false });
const emit = defineEmits<MenuItemEmits>();
defineSlots<{
  /**
   * The content of the item: text, and an icon if you like. The text is what typing finds. When not set, the item
   * shows no text.
   *
   * @example
   * <MenuItem><SvgIcon icon-name="pencil" /> Rename</MenuItem>
   */
  default?(): unknown;
}>();

const ctx = useMenuContext('MenuItem');
const themeAttrs = useThemeAttrs(menuAnatomy);
const attrs = useAttrs();
const key = useId();
const root = useTemplateRef<ComponentPublicInstance>('root');
const element = computed(() => rootElementOf(root.value) as HTMLElement | null);
const machine = computed(() =>
  getMenuProps(ctx.state.value, ctx.send).item({ key, text: '', disabled: props.disabled }),
);

// A click runs the item: the `select` listeners first, and one that prevents the event keeps the menu open. A
// consumer click listener runs before this one (`mergeProps` chains it first) and can veto the click.
function onClick(event: Event): void {
  if (event.defaultPrevented) return;
  let prevented = false;
  if (!props.disabled) {
    const select = new Event('select', { cancelable: true });
    emit('select', select);
    prevented = select.defaultPrevented;
  }
  ctx.send({ type: 'ITEM.RUN', key, disabled: props.disabled, prevented, event });
}

// The machine's attributes are reserved: they replace the same attribute of the author.
const bound = computed(() =>
  mergeProps(themeAttrs.value.item, omit(attrs, 'role', 'aria-disabled', 'data-disabled'), {
    ...vueProps(machine.value),
    onClick,
  }),
);
// The machine's attributes win over an `asChild` child's own props.
const priorityAttrs = computed(() => Object.keys(vueProps(machine.value)).filter((name) => name !== 'class'));

// Registers once per key (again when the element or the disabled fact changes).
let unregister: (() => void) | undefined;
function register(): void {
  if (!element.value) return;
  unregister = ctx.registerItem({ key, element: element.value, disabled: props.disabled });
}
onMounted(register);
watch([() => props.disabled, element], register, { flush: 'post' });
onBeforeUnmount(() => {
  const node = element.value;
  // An item that goes away with focus on it sends focus to the content, while the menu stays open.
  const hadFocus = node !== null && deepActiveElement(node.ownerDocument) === node;
  unregister?.();
  if (!hadFocus) return;
  void nextTick(() => {
    if (ctx.open.value) ctx.contentElement.value?.focus();
  });
});
</script>

<template>
  <Primitive ref="root" v-bind="bound" :as="as" :as-child="asChild" :priority-attrs="priorityAttrs">
    <slot />
  </Primitive>
</template>
