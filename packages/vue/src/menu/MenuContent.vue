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
  useTemplateRef,
  watch,
  type ComponentPublicInstance,
} from 'vue';
import { createDismissLayer, type DismissLayer } from '@cocokits/cdk/dismissal';
import { captureFocusReturn, connectFocusGuards, scheduleFocus } from '@cocokits/cdk/focus';
import { startOverlayPosition, type OverlayAlign, type OverlaySide } from '@cocokits/cdk/positioning';
import { createPresence } from '@cocokits/cdk/presence';
import { getMenuProps, menuAnatomy } from '@cocokits/machines/menu';
import { visuallyHiddenStyle } from '@cocokits/utils';
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
import { warnWithoutTrigger } from '../internal/trigger-warning';
import { vueProps } from './menu-props';
import { useMenuContext } from './menu.context';
import type { MenuContentEmits, MenuContentProps } from './menu.types';

defineOptions({ name: 'CckMenuContent', inheritAttrs: false });

const props = withDefaults(defineProps<MenuContentProps>(), {
  side: 'bottom',
  align: 'start',
  sideOffset: undefined,
  alignOffset: undefined,
  as: 'div',
  asChild: false,
});
const emit = defineEmits<MenuContentEmits>();
defineSlots<{
  /**
   * The items of the menu, and any `Divider` between them. When not set, the menu is empty and takes focus itself.
   *
   * @example
   * <MenuContent>
   *   <MenuItem>Rename</MenuItem>
   *   <Divider />
   *   <MenuItem>Delete</MenuItem>
   * </MenuContent>
   */
  default?(): unknown;
}>();

const ctx = useMenuContext('MenuContent');
warnWithoutTrigger(
  'MenuContent',
  'MenuTrigger',
  () => ctx.open.value,
  () => ctx.triggerElement.value,
);
const themeAttrs = useThemeAttrs(menuAnatomy);
const direction = useDirection();
const attrs = useAttrs();

// The side and alignment after flip and shift; the requested ones until the first measure.
const placement = shallowRef<{ side: OverlaySide; align: OverlayAlign } | null>(null);
const named = computed(() => attrs['aria-label'] !== undefined || attrs['aria-labelledby'] !== undefined);

const startGuard = useTemplateRef<HTMLElement>('startGuard');
const endGuard = useTemplateRef<HTMLElement>('endGuard');
function setContent(instance: unknown): void {
  ctx.contentElement.value = rootElementOf(instance as ComponentPublicInstance | null) as HTMLElement | null;
}

const machine = computed(
  () =>
    getMenuProps(
      {
        ...ctx.state.value,
        side: placement.value?.side ?? props.side,
        align: placement.value?.align ?? props.align,
        named: named.value,
      },
      ctx.send,
    ).content,
);

// Enter and Space press the active item, not the content: with focus on the content nothing runs.
function onKeydown(event: KeyboardEvent): void {
  if (event.target === ctx.contentElement.value && (event.key === 'Enter' || event.key === ' ')) return;
  machine.value.onKeyDown(event);
}

const bound = computed(() =>
  mergeProps(themeAttrs.value.content, attrs, {
    ...vueProps(machine.value),
    ...(named.value ? {} : { 'aria-labelledby': ctx.triggerId.value }),
    onKeydown,
  }),
);
const priorityAttrs = ['id', 'role', 'tabindex', 'data-state', 'data-side', 'data-align'];

const handlers = {
  escapeKeyDown: (event: KeyboardEvent) => {
    emit('escapeKeyDown', event);
  },
  pointerDownOutside: (event: PointerDownOutsideEvent) => {
    emit('pointerDownOutside', event);
  },
  focusOutside: (event: FocusOutsideEvent) => {
    emit('focusOutside', event);
  },
  interactOutside: (event: PointerDownOutsideEvent | FocusOutsideEvent) => {
    emit('interactOutside', event);
  },
};

// A menu opened inside a popover or dialog registers as its child layer.
const parentLayer = inject(DISMISS_LAYER_KEY, undefined);
const ownLayer = shallowRef<DismissLayer | null>(null);
provide(DISMISS_LAYER_KEY, ownLayer);

const presence = createPresence({
  getElement: () => ctx.contentElement.value,
  onStateChange: (state) => {
    ctx.mounted.value = state !== 'unmounted';
    if (state === 'unmounted') placement.value = null;
  },
});
onMounted(() => {
  if (ctx.open.value) presence.setOpen(true);
});
onBeforeUnmount(() => {
  presence.destroy();
});

// The item focus goes to on open: the first (the last after ArrowUp); the content itself when there is none.
function focusInitial(content: HTMLElement): void {
  const initial = ctx.initial.value;
  ctx.initial.value = 'first';
  const target = (initial === 'last' ? ctx.items.value.at(-1) : ctx.items.value[0])?.element ?? content;
  target.focus();
}

// Mount and unmount (with the exit animation), and while the content is open: dismissal, the focus guards, the
// move of focus into the content and back. `presence.setOpen(false)` runs after the closed state is rendered.
watch(
  [ctx.open, ctx.contentElement],
  ([open, element], _previous, onCleanup) => {
    presence.setOpen(open);
    if (!open || !element) return;
    const doc = element.ownerDocument;
    const focusReturn = captureFocusReturn({
      getTrigger: () => ctx.triggerElement.value,
      getContent: () => ctx.contentElement.value,
    });
    // The guards listen first: a focus on a guard closes the menu (it is outside), and the close removes the
    // guard in the same event, so a listener that ran after the layer's would find no guard to forward the focus
    // from.
    const guards = connectFocusGuards({
      getContent: () => ctx.contentElement.value,
      getTrigger: () => ctx.triggerElement.value,
      getGuards: () => [startGuard.value, endGuard.value],
    });
    const layer = createDismissLayer({
      getInsideElements: () => [ctx.triggerElement.value, ctx.contentElement.value],
      onDismiss: (intent) => {
        if (dismissRefused(intent, handlers)) return;
        ctx.send({ type: 'CONTENT.DISMISS', reason: intent.reason, event: intent.event });
      },
      dismissOn: ['escape', 'outside-press', 'focus-out'],
      getParent: () => parentLayer?.value ?? null,
    });
    ownLayer.value = layer;
    const cancelFocus = scheduleFocus(doc, () => {
      const current = ctx.contentElement.value;
      if (ctx.open.value && current) focusInitial(current);
    });
    onCleanup(() => {
      cancelFocus();
      guards.destroy();
      layer.destroy();
      ownLayer.value = null;
      // After the press that closed it has moved focus (the browser blurs to the body once the press handlers are
      // done), so a press on another control keeps focus there and a press on empty space returns it to the trigger.
      if (ctx.open.value) {
        focusReturn.destroy();
        return;
      }
      scheduleFocus(doc, () => {
        focusReturn.restore();
        focusReturn.destroy();
      });
    });
  },
  { flush: 'post' },
);

const positioning = useOverlayPositioning(props, () => undefined);

// Positioning restarts when a placement option changes. An unset offset is not passed, so the theme's applies.
watch(
  [ctx.open, ctx.contentElement, () => props.side, () => props.align, ctx.triggerElement, ...positioning.sources],
  ([open, element, side, align], _previous, onCleanup) => {
    if (!open || !element) return;
    onCleanup(
      startOverlayPosition({
        getAnchor: () => ctx.triggerElement.value,
        getContent: () => ctx.contentElement.value,
        side,
        align,
        getDirection: () => direction.value,
        onPlacementChange: (next) => {
          placement.value = next;
        },
        ...positioning.options(),
      }),
    );
  },
  { flush: 'post' },
);
</script>

<template>
  <Portal :open="ctx.mounted.value" :get-trigger="() => ctx.triggerElement.value">
    <!-- Two empty tab stops: Tab leaves the menu from them. They are not a look: the shared hidden style. -->
    <span ref="startGuard" tabindex="0" :style="visuallyHiddenStyle" />
    <Primitive :ref="setContent" v-bind="bound" :as="as" :as-child="asChild" :priority-attrs="priorityAttrs">
      <slot />
    </Primitive>
    <span ref="endGuard" tabindex="0" :style="visuallyHiddenStyle" />
  </Portal>
</template>
