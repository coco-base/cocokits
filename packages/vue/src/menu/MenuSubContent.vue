<script setup lang="ts">
import {
  computed,
  inject,
  mergeProps,
  onBeforeUnmount,
  onMounted,
  provide,
  shallowRef,
  useAttrs,
  watch,
  type ComponentPublicInstance,
} from 'vue';
import { createDismissLayer, type DismissLayer } from '@cocokits/cdk/dismissal';
import { scheduleFocus } from '@cocokits/cdk/focus';
import { startOverlayPosition, type OverlayAlign, type OverlaySide } from '@cocokits/cdk/positioning';
import { createPresence } from '@cocokits/cdk/presence';
import { getMenuProps, getMenuSubPlacement, menuAnatomy } from '@cocokits/machines/menu';
import {
  Portal,
  Primitive,
  useDirection,
  useThemeAttrs,
  type FocusOutsideEvent,
  type PointerDownOutsideEvent,
} from '@cocokits/vue-core';
import { dismissRefused } from '../internal/dismiss-handlers';
import { DISMISS_LAYER_KEY } from '../internal/dismiss-layer';
import { useOverlayPositioning } from '../internal/overlay-positioning';
import { rootElementOf } from '../internal/root-element';
import { vueProps } from './menu-props';
import { MENU_KEY, useMenuSubContext } from './menu.context';
import type { MenuSubContentEmits, MenuSubContentProps } from './menu-sub.types';

defineOptions({ name: 'CckMenuSubContent', inheritAttrs: false });

const props = withDefaults(defineProps<MenuSubContentProps>(), {
  sideOffset: undefined,
  alignOffset: undefined,
  as: 'div',
  asChild: false,
});
const emit = defineEmits<MenuSubContentEmits>();
defineSlots<{
  /**
   * The items of the submenu, and any `Divider` between them. When not set, the submenu is empty and takes focus
   * itself.
   *
   * @example
   * <MenuSubContent>
   *   <MenuItem>Email</MenuItem>
   *   <MenuItem>Link</MenuItem>
   * </MenuSubContent>
   */
  default?(): unknown;
}>();

const sub = useMenuSubContext('MenuSubContent');
const { menu } = sub;
// The items inside the sub-content belong to the submenu, not to the menu around it.
provide(MENU_KEY, menu);
const themeAttrs = useThemeAttrs(menuAnatomy);
const direction = useDirection();
const attrs = useAttrs();

// The side and alignment after flip and shift; the requested ones until the first measure.
const placement = shallowRef<{ side: OverlaySide; align: OverlayAlign } | null>(null);
const named = computed(() => attrs['aria-label'] !== undefined || attrs['aria-labelledby'] !== undefined);

function setContent(instance: unknown): void {
  menu.contentElement.value = rootElementOf(instance as ComponentPublicInstance | null) as HTMLElement | null;
}

const machine = computed(
  () =>
    getMenuProps(
      {
        ...menu.state.value,
        side: placement.value?.side ?? 'bottom',
        align: placement.value?.align ?? 'start',
        named: named.value,
      },
      menu.send,
    ).content,
);
const bound = computed(() => mergeProps(themeAttrs.value.subContent, attrs, vueProps(machine.value)));
const priorityAttrs = ['id', 'role', 'tabindex', 'data-state', 'data-side', 'data-align'];

const handlers = {
  escapeKeyDown: (event: KeyboardEvent) => {
    emit('escapeKeyDown', event);
  },
  pointerDownOutside: (event: PointerDownOutsideEvent) => {
    emit('pointerDownOutside', event);
  },
  interactOutside: (event: PointerDownOutsideEvent | FocusOutsideEvent) => {
    emit('interactOutside', event);
  },
};

// A submenu is a child layer of the menu it opens from, so Escape closes only the submenu.
const parentLayer = inject(DISMISS_LAYER_KEY, undefined);
const ownLayer = shallowRef<DismissLayer | null>(null);
provide(DISMISS_LAYER_KEY, ownLayer);

const presence = createPresence({
  getElement: () => menu.contentElement.value,
  onStateChange: (state) => {
    menu.mounted.value = state !== 'unmounted';
    if (state === 'unmounted') placement.value = null;
  },
});
onMounted(() => {
  if (menu.open.value) presence.setOpen(true);
});
onBeforeUnmount(() => {
  presence.destroy();
});

// A key that opened the submenu puts focus on its first item (the last when asked); a pointer or a click leaves it.
function focusInitial(content: HTMLElement, initial: 'first' | 'last'): void {
  const target = (initial === 'last' ? menu.items.value.at(-1) : menu.items.value[0])?.element ?? content;
  target.focus();
}

// Mount and unmount (with the exit animation), and while the submenu is open: dismissal and the move of focus into
// it. `presence.setOpen(false)` runs after the closed state is rendered.
watch(
  [menu.open, menu.contentElement],
  ([open, element], _previous, onCleanup) => {
    presence.setOpen(open);
    if (!open || !element) return;
    const layer = createDismissLayer({
      getInsideElements: () => [menu.triggerElement.value, menu.contentElement.value],
      onDismiss: (intent) => {
        if (intent.reason === 'focus-out' || dismissRefused(intent, handlers)) return;
        menu.send({ type: 'SUB.DISMISS', reason: intent.reason, event: intent.event });
      },
      dismissOn: ['escape', 'outside-press'],
      getParent: () => parentLayer?.value ?? null,
    });
    ownLayer.value = layer;
    // Only an opening by key moves focus: the initial item was asked for. A pointer leaves focus on the sub-trigger.
    const asked = sub.focusRequest.value;
    sub.focusRequest.value = null;
    const cancelFocus =
      asked === null
        ? () => undefined
        : scheduleFocus(element.ownerDocument, () => {
            const current = menu.contentElement.value;
            if (menu.open.value && current) focusInitial(current, asked);
          });
    onCleanup(() => {
      cancelFocus();
      layer.destroy();
      ownLayer.value = null;
    });
  },
  { flush: 'post' },
);

const positioning = useOverlayPositioning(props, () => undefined);

// Positioning restarts when a placement option changes. The content starts at the bottom-end corner of the
// sub-trigger; with no room it flips to the start side, then above. An unset offset is not passed, so the theme's applies.
watch(
  [menu.open, menu.contentElement, menu.triggerElement, ...positioning.sources],
  ([open, element, anchor], _previous, onCleanup) => {
    if (!open || !element || !anchor) return;
    const placing = getMenuSubPlacement(anchor.getBoundingClientRect().width);
    onCleanup(
      startOverlayPosition({
        getAnchor: () => menu.triggerElement.value,
        getContent: () => menu.contentElement.value,
        side: placing.side,
        align: placing.align,
        fallbackSides: placing.fallbackSides,
        getDirection: () => direction.value,
        onPlacementChange: (next) => {
          placement.value = next;
        },
        ...positioning.options(),
        // The author's `alignOffset` adds to the move that puts the content at the end of the sub-trigger.
        alignOffset: placing.alignOffset + (props.alignOffset ?? 0),
      }),
    );
  },
  { flush: 'post' },
);
</script>

<template>
  <Portal :open="menu.mounted.value" :get-trigger="() => menu.triggerElement.value">
    <Primitive :ref="setContent" v-bind="bound" :as="as" :as-child="asChild" :priority-attrs="priorityAttrs">
      <slot />
    </Primitive>
  </Portal>
</template>
