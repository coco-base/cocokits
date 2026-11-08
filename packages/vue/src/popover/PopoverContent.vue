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
import {
  captureFocusReturn,
  connectFocusGuards,
  focusFirst,
  makeOutsideInert,
  scheduleFocus,
} from '@cocokits/cdk/focus';
import { startOverlayPosition, type OverlayAlign, type OverlaySide } from '@cocokits/cdk/positioning';
import { createPresence } from '@cocokits/cdk/presence';
import { lockScroll } from '@cocokits/cdk/scroll-lock';
import { getPopoverProps, popoverAnatomy } from '@cocokits/machines/popover';
import { hasAccessibleName, visuallyHiddenStyle } from '@cocokits/utils';
import {
  isDevelopment,
  Portal,
  Primitive,
  provideDirection,
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
import { usePopoverContext } from './popover.context';
import type { PopoverContentEmits, PopoverContentProps } from './popover.types';

defineOptions({ name: 'CckPopoverContent', inheritAttrs: false });

const props = withDefaults(defineProps<PopoverContentProps>(), {
  side: 'bottom',
  align: 'center',
  reference: undefined,
  forceMount: false,
  sideOffset: undefined,
  alignOffset: undefined,
  avoidCollisions: undefined,
  collisionPadding: undefined,
  sticky: undefined,
  hideWhenDetached: undefined,
  collisionBoundary: undefined,
  updatePositionStrategy: undefined,
  arrowPadding: undefined,
  hideShiftedArrow: undefined,
  sideFlip: undefined,
  alignFlip: undefined,
  prioritizePosition: undefined,
  disableUpdateOnLayoutShift: undefined,
  as: 'div',
  asChild: false,
});
const emit = defineEmits<PopoverContentEmits>();
defineSlots<{
  /**
   * The content of the popover: text, form controls and a `PopoverClose`. When not set, the popover is empty.
   *
   * @example
   * <PopoverContent>
   *   <PopoverTitle>Share</PopoverTitle>
   *   <PopoverClose>Close</PopoverClose>
   * </PopoverContent>
   */
  default?(): unknown;
}>();

const ctx = usePopoverContext('PopoverContent');
warnWithoutTrigger(
  'PopoverContent',
  'PopoverTrigger',
  () => ctx.open.value,
  () => ctx.triggerElement.value,
);
const themeAttrs = useThemeAttrs(popoverAnatomy);
// The own `dir` is the direction of the subtree, as a provider would set it: the portal host and nested parts read it.
const direction = useDirection(() => props.dir);
provideDirection(direction);
const attrs = useAttrs();

// The side and alignment after flip and shift; the requested ones until the first measure.
const placement = shallowRef<{ side: OverlaySide; align: OverlayAlign } | null>(null);
// Whether the anchor is fully hidden by its clipping ancestors; only reported with `hideWhenDetached`.
const anchorHidden = shallowRef(false);
// Whether the content is gone from the document as far as the open state goes: no exit animation is running.
const presenceGone = shallowRef(true);
// Whether the client rendered the component: the server and the first client render hold no content.
const clientMounted = shallowRef(false);
// The `modal` the popover opened with: a change while it is open takes effect at the next open.
const modalNow = shallowRef(false);
// Force-mounted content that is closed and has finished its exit: it stays in the document, hidden.
const keptClosed = computed(() => props.forceMount && clientMounted.value && !ctx.open.value && presenceGone.value);
function syncMounted(): void {
  ctx.mounted.value = !presenceGone.value || (props.forceMount && clientMounted.value);
}
watch(() => props.forceMount, syncMounted);
const machine = computed(
  () =>
    getPopoverProps(
      {
        id: ctx.id,
        open: ctx.open.value,
        mounted: ctx.mounted.value,
        side: placement.value?.side ?? props.side,
        align: placement.value?.align ?? props.align,
        hasTitle: ctx.titles.value > 0,
        hasDescription: ctx.descriptions.value > 0,
        anchorHidden: anchorHidden.value,
        modal: modalNow.value,
        keptClosed: keptClosed.value,
      },
      ctx.send,
    ).content,
);
const bound = computed(() => mergeProps(themeAttrs.value.content, attrs, { ...machine.value }));
const priorityAttrs = ['id', 'role', 'tabindex', 'data-state', 'data-side', 'data-align', 'hidden'];

const startGuard = useTemplateRef<HTMLElement>('startGuard');
const endGuard = useTemplateRef<HTMLElement>('endGuard');
function setContent(instance: unknown): void {
  ctx.contentElement.value = rootElementOf(instance as ComponentPublicInstance | null) as HTMLElement | null;
}

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

// A popover opened inside this one registers as its child layer.
const parentLayer = inject(DISMISS_LAYER_KEY, undefined);
const ownLayer = shallowRef<DismissLayer | null>(null);
provide(DISMISS_LAYER_KEY, ownLayer);

const presence = createPresence({
  getElement: () => ctx.contentElement.value,
  onStateChange: (state) => {
    presenceGone.value = state === 'unmounted';
    syncMounted();
    if (state === 'unmounted') {
      placement.value = null;
      modalNow.value = false;
    }
  },
});
onMounted(() => {
  clientMounted.value = true;
  syncMounted();
  if (ctx.open.value) presence.setOpen(true);
});
onBeforeUnmount(() => {
  presence.destroy();
});

// Mount and unmount (with the exit animation), and while the content is open: dismissal, the focus guards, the
// move of focus into the content and back. `presence.setOpen(false)` runs after the closed state is rendered.
watch(
  [ctx.open, ctx.contentElement],
  ([open, element], _previous, onCleanup) => {
    presence.setOpen(open);
    if (!open || !element) return;
    const doc = element.ownerDocument;
    const modal = ctx.modal.value;
    modalNow.value = modal;
    // After a title has labelled the content.
    const nameCheck = isDevelopment()
      ? doc.defaultView?.requestAnimationFrame(() => {
          if (!hasAccessibleName(element)) {
            console.warn(
              'CocoKits: <PopoverContent> has no accessible name. Add a <PopoverTitle>, or an aria-label or aria-labelledby.',
            );
          }
        })
      : undefined;
    const focusReturn = captureFocusReturn({
      getTrigger: () => ctx.triggerElement.value,
      getContent: () => ctx.contentElement.value,
    });
    // The guards listen first: a focus on a guard closes the popover (it is outside), and the close removes the
    // guard in the same event, so a listener that ran after the layer's would find no guard to forward the focus
    // from.
    const guards = connectFocusGuards({
      getContent: () => ctx.contentElement.value,
      getTrigger: () => ctx.triggerElement.value,
      getGuards: () => [startGuard.value, endGuard.value],
      ...(modal ? { loop: true } : {}),
    });
    // The guards are tab stops of the popover, so they stay usable.
    const release = modal ? makeOutsideInert(() => [element, startGuard.value, endGuard.value]) : undefined;
    const unlock = modal ? lockScroll(doc) : undefined;
    const layer = createDismissLayer({
      // The guards of a modal popover keep Tab inside, so focus on one is not leaving.
      getInsideElements: () => [
        ctx.triggerElement.value,
        ctx.contentElement.value,
        ...(modal ? [startGuard.value, endGuard.value] : []),
      ],
      onDismiss: (intent) => {
        if (dismissRefused(intent, handlers)) return;
        ctx.send({ type: 'CONTENT.DISMISS', reason: intent.reason, event: intent.event });
      },
      dismissOn: ['escape', 'outside-press', 'focus-out'],
      ...(modal ? { modal } : {}),
      getParent: () => parentLayer?.value ?? null,
    });
    ownLayer.value = layer;
    const cancelFocus = scheduleFocus(doc, () => {
      const current = ctx.contentElement.value;
      if (!ctx.open.value || !current) return;
      const event = new Event('focusScope.autoFocusOnMount', { cancelable: true });
      emit('openAutoFocus', event);
      if (!event.defaultPrevented) focusFirst(current);
    });
    onCleanup(() => {
      if (nameCheck !== undefined) doc.defaultView?.cancelAnimationFrame(nameCheck);
      cancelFocus();
      guards.destroy();
      layer.destroy();
      ownLayer.value = null;
      // Before the focus goes back: the trigger is outside the content, so it is inert until now.
      release?.();
      unlock?.();
      // After the press that closed it has moved focus (the browser blurs to the body once the press handlers are
      // done), so a press on another control keeps focus there and a press on empty space returns it to the trigger.
      if (ctx.open.value) {
        focusReturn.destroy();
        return;
      }
      scheduleFocus(doc, () => {
        const event = new Event('focusScope.autoFocusOnUnmount', { cancelable: true });
        emit('closeAutoFocus', event);
        if (!event.defaultPrevented) focusReturn.restore();
        focusReturn.destroy();
      });
    });
  },
  { flush: 'post' },
);

const positioning = useOverlayPositioning(props, (hidden) => {
  anchorHidden.value = hidden;
});

// Positioning restarts when a positioning option changes. An unset option is not passed, so the positioning
// defaults apply. The anchor is the `reference`, else the last mounted `PopoverAnchor`, else the trigger. The arrow
// is measured when positioning starts, so it restarts when the arrow part mounts.
watch(
  [
    ctx.open,
    ctx.contentElement,
    () => props.side,
    () => props.align,
    ctx.triggerElement,
    ctx.anchor,
    () => props.reference,
    ctx.arrowElement,
    ...positioning.sources,
  ],
  ([open, element, side, align], _previous, onCleanup) => {
    if (!open || !element) return;
    onCleanup(
      startOverlayPosition({
        getAnchor: () => props.reference ?? ctx.anchor.value ?? ctx.triggerElement.value,
        getContent: () => ctx.contentElement.value,
        side,
        align,
        getDirection: () => direction.value,
        onPlacementChange: (next) => {
          placement.value = next;
        },
        getArrow: () => ctx.arrowElement.value,
        onArrowHiddenChange: (hidden) => {
          ctx.arrowHidden.value = hidden;
        },
        ...positioning.options(),
      }),
    );
    onCleanup(() => {
      anchorHidden.value = false;
      ctx.arrowHidden.value = false;
    });
  },
  { flush: 'post' },
);
</script>

<template>
  <Portal :open="ctx.mounted.value" :get-trigger="() => ctx.triggerElement.value">
    <!-- Two empty tab stops: Tab leaves the popover from them. They are not a look: the shared hidden style. -->
    <span v-if="!keptClosed" ref="startGuard" tabindex="0" :style="visuallyHiddenStyle" />
    <Primitive :ref="setContent" v-bind="bound" :as="as" :as-child="asChild" :priority-attrs="priorityAttrs">
      <slot />
    </Primitive>
    <span v-if="!keptClosed" ref="endGuard" tabindex="0" :style="visuallyHiddenStyle" />
  </Portal>
</template>
