<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, provide, shallowRef, useId, watch } from 'vue';
import {
  transitionMenuSub,
  type MenuEvent,
  type MenuInitialFocus,
  type MenuState,
  type MenuSubTransition,
} from '@cocokits/machines/menu';
import { useDirection } from '@cocokits/vue-core';
import { liveElementRef } from '../internal/live-element';
import { useDefaultModel } from '../internal/use-default-model';
import { MENU_SUB_KEY, useMenuContext, type MenuContextValue } from './menu.context';
import type { MenuSubEmits, MenuSubProps } from './menu-sub.types';
import { useMenuItems } from './use-menu-items';

defineOptions({ name: 'CckMenuSub', inheritAttrs: false });

const props = withDefaults(defineProps<MenuSubProps>(), { open: undefined, defaultOpen: false });
defineEmits<MenuSubEmits>();
defineSlots<{
  /**
   * The parts of the submenu: a `MenuSubTrigger` and a `MenuSubContent`. When not set, the submenu has no parts.
   *
   * The sub renders no element around them.
   *
   * @example
   * <MenuSub>
   *   <MenuSubTrigger>Share</MenuSubTrigger>
   *   <MenuSubContent><MenuItem>Email</MenuItem></MenuSubContent>
   * </MenuSub>
   */
  default?(): unknown;
}>();

const parent = useMenuContext('MenuSub');
const model = useDefaultModel(props, 'open', props.defaultOpen);
const open = computed(() => model.value === true);
const id = useId();
const direction = useDirection();
const menu = useMenuItems();
const initial = shallowRef<MenuInitialFocus>('first');
const mounted = shallowRef(false);
const trigger = liveElementRef();
const triggerId = shallowRef<string | undefined>(undefined);
const triggerKey = shallowRef<string | undefined>(undefined);
const triggerDisabled = shallowRef(false);
const focusRequest = shallowRef<MenuInitialFocus | null>(null);
const contentElement = shallowRef<HTMLElement | null>(null);
let timer: ReturnType<typeof setTimeout> | undefined;

const state = computed<MenuState>(() => ({
  id,
  open: open.value,
  mounted: mounted.value,
  items: menu.entries.value,
  activeKey: menu.activeKey.value,
  typeahead: menu.typeahead,
  dir: direction.value,
  sub: true,
  triggerId: triggerId.value,
}));

/** The first item of the open submenu gets the focus: a key asked to open a submenu that is open already. */
function focusFirst(): void {
  menu.items.value[0]?.element.focus();
}

/** Applies what the machine asked for: after its wait, if it has one, and then the focus back to the sub-trigger. */
function apply(next: MenuSubTransition): void {
  clearTimeout(timer);
  const run = (): void => {
    if (next.open) focusRequest.value = next.initial ?? null;
    if (next.open !== open.value) model.value = next.open; // emits update:open
    if (next.focus === 'trigger') {
      void nextTick(() => {
        trigger.element.value?.focus();
      });
    }
  };
  if (next.delay === undefined) run();
  else timer = setTimeout(run, next.delay);
}

/** The one handler of the submenu: the events of its items, of its sub-trigger and of its layer. */
function send(event: MenuEvent): void {
  if (menu.handle(event) === 'handled') return;
  if (event.type === 'ITEM.RUN') {
    // A press on an item closes the whole menu.
    if (!event.disabled && !event.prevented) closeAll(event.event);
    return;
  }
  if (event.type === 'SUB.TRIGGER.OPEN' && open.value) {
    focusFirst();
    return;
  }
  // Only a pointer that stays on the sub-trigger opens it: any other event ends the wait.
  if (event.type !== 'SUB.TRIGGER.POINTER_MOVE') clearTimeout(timer);
  const next = transitionMenuSub({ open: open.value, disabled: triggerDisabled.value }, event);
  if (next) apply(next);
}

function closeAll(event: Event): void {
  clearTimeout(timer);
  if (open.value) model.value = false;
  parent.closeAll(event);
}

// The pointer on another item of the parent menu closes the submenu.
const stop = parent.onPointerMoved((key, event) => {
  if (key !== triggerKey.value) send({ type: 'SUB.PARENT.POINTER_MOVE', event });
});
onBeforeUnmount(() => {
  stop();
  clearTimeout(timer);
  menu.typeahead.reset();
});

// A closed submenu starts the next search and the next tab stop afresh.
watch(open, (isOpen) => {
  if (!isOpen) menu.reset();
});

const context: MenuContextValue = {
  id,
  open,
  mounted,
  triggerElement: trigger.element,
  followTrigger: trigger.follow,
  triggerId,
  contentElement,
  state,
  initial,
  items: menu.items,
  send,
  registerItem: menu.registerItem,
  pointerMoved: menu.pointerMoved,
  onPointerMoved: menu.onPointerMoved,
  closeAll,
};
// The items of the submenu are the children of its sub-content, which provides `menu` to them.
provide(MENU_SUB_KEY, { parent, menu: context, triggerKey, triggerDisabled, focusRequest });
</script>

<template>
  <slot />
</template>
