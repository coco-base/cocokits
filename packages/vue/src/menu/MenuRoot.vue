<script setup lang="ts">
import { computed, onBeforeUnmount, provide, shallowRef, useId, watch } from 'vue';
import { transitionMenu, type MenuEvent, type MenuInitialFocus, type MenuState } from '@cocokits/machines/menu';
import { useDirection } from '@cocokits/vue-core';
import { liveElementRef } from '../internal/live-element';
import { useDefaultModel } from '../internal/use-default-model';
import { MENU_KEY } from './menu.context';
import type { MenuRootEmits, MenuRootProps } from './menu.types';
import { useMenuItems } from './use-menu-items';

defineOptions({ name: 'CckMenuRoot', inheritAttrs: false });

const props = withDefaults(defineProps<MenuRootProps>(), { open: undefined, defaultOpen: false });
defineEmits<MenuRootEmits>();
defineSlots<{
  /**
   * The parts of the menu: a trigger and the content. When not set, the menu has no parts.
   *
   * The root renders no element around them.
   *
   * @example
   * <MenuRoot>
   *   <MenuTrigger>Actions</MenuTrigger>
   *   <MenuContent>
   *     <MenuItem @select="rename">Rename</MenuItem>
   *   </MenuContent>
   * </MenuRoot>
   */
  default?(): unknown;
}>();

const model = useDefaultModel(props, 'open', props.defaultOpen);
const open = computed(() => model.value === true);
const id = useId();
const direction = useDirection();
const menu = useMenuItems();
const initial = shallowRef<MenuInitialFocus>('first');
const mounted = shallowRef(false);

const state = computed<MenuState>(() => ({
  id,
  open: open.value,
  mounted: mounted.value,
  items: menu.entries.value,
  activeKey: menu.activeKey.value,
  typeahead: menu.typeahead,
  dir: direction.value,
}));

/** A press on an item closes the menu, and so every menu it is the submenu of. */
function closeAll(): void {
  if (open.value) model.value = false; // emits update:open
}

function send(event: MenuEvent): void {
  if (menu.handle(event) === 'handled') return;
  const next = transitionMenu(state.value, event);
  if (!next || next.open === open.value) return;
  if (next.open) initial.value = next.initial ?? 'first';
  model.value = next.open; // emits update:open
}

// A closed menu starts the next search and the next tab stop afresh.
watch(open, (isOpen) => {
  if (!isOpen) menu.reset();
});
onBeforeUnmount(() => {
  menu.typeahead.reset();
});

const trigger = liveElementRef();

provide(MENU_KEY, {
  id,
  open,
  // Nothing is mounted on the server or in the first client render, so the markup matches.
  mounted,
  triggerElement: trigger.element,
  followTrigger: trigger.follow,
  triggerId: shallowRef(undefined),
  contentElement: shallowRef(null),
  state,
  initial,
  items: menu.items,
  send,
  registerItem: menu.registerItem,
  pointerMoved: menu.pointerMoved,
  onPointerMoved: menu.onPointerMoved,
  closeAll,
});
</script>

<template>
  <slot />
</template>
