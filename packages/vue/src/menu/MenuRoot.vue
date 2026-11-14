<script setup lang="ts">
import { computed, provide, shallowRef, useId, watch } from 'vue';
import { createTypeahead } from '@cocokits/cdk/roving-focus';
import { transitionMenu, type MenuEvent, type MenuInitialFocus, type MenuState } from '@cocokits/machines/menu';
import { liveElementRef } from '../internal/live-element';
import { useDefaultModel } from '../internal/use-default-model';
import { MENU_KEY } from './menu.context';
import type { MenuRootEmits, MenuRootProps } from './menu.types';
import { useMenuRegistry } from './use-menu-registry';

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
const registry = useMenuRegistry();
const typeahead = createTypeahead();
const activeKey = shallowRef<string | undefined>(undefined);
const initial = shallowRef<MenuInitialFocus>('first');
const mounted = shallowRef(false);

const state = computed<MenuState>(() => ({
  id,
  open: open.value,
  mounted: mounted.value,
  // The text is read when a key is pressed: an item can change its text without a new registration.
  items: registry.items.value.map((item) => ({
    key: item.key,
    disabled: item.disabled,
    get text() {
      return item.element.textContent;
    },
  })),
  activeKey: activeKey.value,
  typeahead,
}));

function itemElement(key: string): HTMLElement | undefined {
  return registry.items.value.find((item) => item.key === key)?.element;
}

function send(event: MenuEvent): void {
  if (event.type === 'ITEM.FOCUS') {
    activeKey.value = event.key;
  } else if (event.type === 'ITEM.PRESS') {
    // The click runs the item as a pointer does, so a link item follows its link.
    itemElement(event.key)?.click();
  } else if (event.type === 'CONTENT.MOVE') {
    itemElement(event.key)?.focus();
  } else {
    const next = transitionMenu(state.value, event);
    if (!next || next.open === open.value) return;
    if (next.open) initial.value = next.initial ?? 'first';
    model.value = next.open; // emits update:open
  }
}

// A closed menu starts the next search and the next tab stop afresh.
watch(open, (isOpen) => {
  if (isOpen) return;
  typeahead.reset();
  activeKey.value = undefined;
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
  items: registry.items,
  send,
  registerItem: registry.registerItem,
});
</script>

<template>
  <slot />
</template>
