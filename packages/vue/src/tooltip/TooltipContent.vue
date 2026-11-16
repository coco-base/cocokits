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
  useSlots,
  watch,
  watchPostEffect,
  Comment,
  Fragment,
  Text,
  type ComponentPublicInstance,
  type VNode,
} from 'vue';
import { createDismissLayer, type DismissLayer } from '@cocokits/cdk/dismissal';
import { startOverlayPosition, type OverlayAlign, type OverlaySide } from '@cocokits/cdk/positioning';
import { createPresence } from '@cocokits/cdk/presence';
import { getTooltipProps, tooltipAnatomy } from '@cocokits/machines/tooltip';
import { Portal, Primitive, useDirection, useThemeAttrs, type PointerDownOutsideEvent } from '@cocokits/vue-core';
import { dismissRefused } from '../internal/dismiss-handlers';
import { DISMISS_LAYER_KEY } from '../internal/dismiss-layer';
import { toVueListeners } from '../internal/listeners';
import { useOverlayPositioning } from '../internal/overlay-positioning';
import { rootElementOf } from '../internal/root-element';
import { warnWithoutTrigger } from '../internal/trigger-warning';
import TooltipDescription from './TooltipDescription.vue';
import TooltipTitle from './TooltipTitle.vue';
import { useTooltipContext } from './tooltip.context';
import type { TooltipContentEmits, TooltipContentProps } from './tooltip.types';

defineOptions({ name: 'CckTooltipContent', inheritAttrs: false });

const props = withDefaults(defineProps<TooltipContentProps>(), {
  side: 'top',
  align: 'center',
  as: 'div',
  asChild: false,
  ariaLabel: undefined,
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
});
const emit = defineEmits<TooltipContentEmits>();
defineSlots<{
  /**
   * The text of the tooltip. Keep it free of interactive content, because it never takes the focus. When not set,
   * the tooltip is empty.
   *
   * While the tooltip is closed, its text also describes the trigger, unless `ariaLabel` is set.
   *
   * @example
   * <TooltipContent>Save the draft</TooltipContent>
   */
  default?(): unknown;
}>();

/** The nodes a title or description part renders: its default slot, called now. A render function may return text. */
function partNodes(node: VNode): readonly unknown[] | null {
  const { children } = node;
  const slot = children !== null && typeof children === 'object' && !Array.isArray(children) ? children : null;
  const render = slot === null ? undefined : (slot as { default?: () => unknown }).default;
  if (typeof render !== 'function') return null;
  const out = render();
  return Array.isArray(out) ? (out as unknown[]) : [out];
}

/**
 * The text of a slot that renders text, a title part or a description part only, else `null`: rich content has no
 * description text. The parts are part of the tooltip text, so the trigger is described by the title and the
 * description, one after the other.
 */
function textOf(nodes: readonly VNode[] | undefined): string | null {
  const seen = { part: false };
  const walk = (list: readonly unknown[]): string | null => {
    let text = '';
    for (const entry of list) {
      if (typeof entry === 'string' || typeof entry === 'number') {
        text += String(entry);
        continue;
      }
      const node = entry as VNode;
      if (node.type === Comment) continue;
      if (node.type === Text) {
        text += typeof node.children === 'string' ? node.children : '';
        continue;
      }
      const part = node.type === TooltipTitle || node.type === TooltipDescription;
      seen.part ||= part;
      const inner = part ? partNodes(node) : node.type === Fragment ? (node.children as VNode[] | null) : null;
      const piece = Array.isArray(inner) ? walk(inner) : null;
      if (piece === null) return null;
      text += part ? ` ${piece} ` : piece;
    }
    return text;
  };
  const text = nodes ? walk(nodes) : null;
  if (!text?.trim()) return null;
  return seen.part ? text.replace(/\s+/g, ' ').trim() : text;
}

const ctx = useTooltipContext('TooltipContent');
warnWithoutTrigger(
  'TooltipContent',
  'TooltipTrigger',
  () => ctx.open.value,
  () => ctx.triggerElement.value,
);
const themeAttrs = useThemeAttrs(tooltipAnatomy);
const direction = useDirection();
const attrs = useAttrs();
const slots = useSlots();

// The description outlives the content: this part is set up while the tooltip is closed, its layer is not rendered.
// The slot is read after the first render (a post effect), never during setup, and again when its content changes.
watchPostEffect((onCleanup) => {
  const { default: content } = slots;
  ctx.descriptionText.value = props.ariaLabel ?? textOf(content?.());
  onCleanup(() => {
    ctx.descriptionText.value = null;
  });
});

// Whether the anchor is fully hidden by its clipping ancestors; only reported with `hideWhenDetached`.
const anchorHidden = shallowRef(false);

// The side and alignment after flip and shift; the requested ones until the first measure.
const placement = shallowRef<{ side: OverlaySide; align: OverlayAlign } | null>(null);
// Whether the content is gone from the document as far as the open state goes: no exit animation is running.
const presenceGone = shallowRef(true);
// Whether the client rendered the component: the server and the first client render hold no content.
const clientMounted = shallowRef(false);
// Force-mounted content that is closed and has finished its exit: it stays in the document, hidden.
const keptClosed = computed(() => props.forceMount && clientMounted.value && !ctx.open.value && presenceGone.value);
function syncMounted(): void {
  ctx.mounted.value = !presenceGone.value || (props.forceMount && clientMounted.value);
}
watch(() => props.forceMount, syncMounted);
const machine = computed(
  () =>
    getTooltipProps(
      {
        id: ctx.id,
        open: ctx.open.value,
        mounted: ctx.mounted.value,
        side: placement.value?.side ?? props.side,
        align: placement.value?.align ?? props.align,
        description: ctx.description.value,
        keptClosed: keptClosed.value,
      },
      ctx.send,
    ).content,
);
const bound = computed(() =>
  mergeProps(
    themeAttrs.value.content,
    attrs,
    toVueListeners(machine.value),
    anchorHidden.value ? { hidden: true } : {},
  ),
);
const priorityAttrs = ['id', 'role', 'aria-hidden', 'data-state', 'data-side', 'data-align', 'hidden'];

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
};

// A tooltip opened inside an overlay registers as its child layer.
const parentLayer = inject(DISMISS_LAYER_KEY, undefined);
const ownLayer = shallowRef<DismissLayer | null>(null);
provide(DISMISS_LAYER_KEY, ownLayer);

const presence = createPresence({
  getElement: () => ctx.contentElement.value,
  onStateChange: (state) => {
    presenceGone.value = state === 'unmounted';
    syncMounted();
    if (state === 'unmounted') placement.value = null;
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

// Mount and unmount (with the exit animation), and while the tooltip is shown: a layer of the stack, so Escape
// reaches the topmost one and a press outside closes it. Focus leaving is not its concern: the blur closes it. `presence.setOpen(false)` runs after the closed state is rendered.
watch(
  [ctx.open, ctx.contentElement],
  ([open, element], _previous, onCleanup) => {
    presence.setOpen(open);
    if (!open || !element) return;
    const layer = createDismissLayer({
      getInsideElements: () => [ctx.triggerElement.value, ctx.contentElement.value],
      onDismiss: (intent) => {
        if (intent.reason === 'focus-out') return;
        if (dismissRefused(intent, handlers)) return;
        ctx.send({ type: 'CONTENT.DISMISS', reason: intent.reason, event: intent.event });
      },
      getParent: () => parentLayer?.value ?? null,
    });
    ownLayer.value = layer;
    onCleanup(() => {
      layer.destroy();
      ownLayer.value = null;
    });
  },
  { flush: 'post' },
);

const positioning = useOverlayPositioning(props, (hidden) => {
  anchorHidden.value = hidden;
});

// Positioning restarts when a positioning option changes. An unset option is not passed, so the positioning
// defaults apply. The anchor is the trigger's `reference`, else the trigger. The arrow is measured when positioning
// starts, so it restarts when the arrow part mounts.
watch(
  [
    ctx.open,
    ctx.contentElement,
    () => props.side,
    () => props.align,
    ctx.triggerElement,
    ctx.reference,
    ctx.arrowElement,
    ...positioning.sources,
  ],
  ([open, element, side, align], _previous, onCleanup) => {
    if (!open || !element) return;
    onCleanup(
      startOverlayPosition({
        getAnchor: () => ctx.reference.value ?? ctx.triggerElement.value,
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
    <Primitive :ref="setContent" v-bind="bound" :as="as" :as-child="asChild" :priority-attrs="priorityAttrs">
      <slot />
    </Primitive>
  </Portal>
</template>
