<script setup lang="ts">
import { computed, inject, mergeProps, onBeforeUnmount, onMounted, provide, shallowRef, useAttrs, watch } from 'vue';
import type { ComponentPublicInstance } from 'vue';
import { createTriggerDismissLayer, type DismissLayer } from '@cocokits/cdk/dismissal';
import { startOverlayPosition, type OverlayAlign, type OverlaySide } from '@cocokits/cdk/positioning';
import { createPresence } from '@cocokits/cdk/presence';
import { selectAnatomy } from '@cocokits/machines/select';
import {
  Portal,
  Primitive,
  provideDirection,
  useDirection,
  useThemeAttrs,
  type PointerDownOutsideEvent,
} from '@cocokits/vue-core';
import { useOverlayPositioning } from '../internal/overlay-positioning';
import { dismissRefused } from '../internal/dismiss-handlers';
import { DISMISS_LAYER_KEY } from '../internal/dismiss-layer';
import { toVueListeners } from '../internal/listeners';
import { rootElementOf } from '../internal/root-element';
import { useSelectContext } from './select.context';
import type { SelectContentEmits, SelectContentProps } from './select-list.types';

defineOptions({ name: 'CckSelectContent', inheritAttrs: false });

const props = withDefaults(defineProps<SelectContentProps>(), {
  side: 'bottom',
  align: 'start',
  dir: undefined,
  forceMount: false,
  sideOffset: undefined,
  alignOffset: undefined,
  avoidCollisions: undefined,
  collisionPadding: undefined,
  sticky: undefined,
  hideWhenDetached: undefined,
  collisionBoundary: undefined,
  updatePositionStrategy: undefined,
  sideFlip: undefined,
  alignFlip: undefined,
  prioritizePosition: undefined,
  disableUpdateOnLayoutShift: undefined,
  as: 'div',
  asChild: false,
});
const emit = defineEmits<SelectContentEmits>();
defineSlots<{
  /** The list: `SelectItem`s, `SelectGroup`s and `SelectSeparator`s. */
  default?(): unknown;
}>();

const ctx = useSelectContext<unknown>('SelectContent');
const themeAttrs = useThemeAttrs(selectAnatomy);
// The own `dir` is the direction of the subtree, as a provider would set it: the portal host and the placement read it.
const direction = useDirection(() => props.dir);
provideDirection(direction);
const attrs = useAttrs();

// The side and alignment after flip and shift; the requested ones until the first measure.
const placement = shallowRef<{ side: OverlaySide; align: OverlayAlign } | null>(null);
// Whether the list is gone from the document as far as the open state goes: no exit animation is running.
const presenceGone = shallowRef(true);
// Whether the client rendered the component: the server and the first client render hold no list.
const clientMounted = shallowRef(false);
// Whether the anchor is fully hidden by its clipping ancestors; only reported with `hideWhenDetached`.
const anchorHidden = shallowRef(false);
function syncMounted(): void {
  ctx.mounted.value = !presenceGone.value || (props.forceMount && clientMounted.value);
  // The Root's parts hide a force-mounted list that is closed and has finished its exit.
  ctx.keptClosed.value = props.forceMount && clientMounted.value && !ctx.open.value && presenceGone.value;
}
watch(() => props.forceMount, syncMounted);
const machine = computed(() => ({
  ...ctx.parts.value.content,
  ...(anchorHidden.value ? { hidden: true } : {}),
  'data-side': placement.value?.side ?? props.side,
  'data-align': placement.value?.align ?? props.align,
}));
// A name the machine does not know (the trigger carries it) stays the author's.
const bound = computed(() =>
  mergeProps(
    themeAttrs.value.content,
    attrs,
    Object.fromEntries(Object.entries(toVueListeners(machine.value)).filter(([, value]) => value !== undefined)),
  ),
);
const priorityAttrs = [
  'id',
  'role',
  'aria-multiselectable',
  'aria-labelledby',
  'aria-label',
  'data-state',
  'data-multiple',
  'data-side',
  'data-align',
  'hidden',
];

function setContent(instance: unknown): void {
  ctx.contentElement.value = rootElementOf(instance as ComponentPublicInstance | null) as HTMLElement | null;
}

// A Select opened inside another overlay registers as its child layer.
const parentLayer = inject(DISMISS_LAYER_KEY, undefined);
const ownLayer = shallowRef<DismissLayer | null>(null);
provide(DISMISS_LAYER_KEY, ownLayer);

// The list stays in the document after it closes until the exit animation has finished.
const presence = createPresence({
  getElement: () => ctx.contentElement.value,
  onStateChange: (next) => {
    presenceGone.value = next === 'unmounted';
    syncMounted();
    if (next === 'unmounted') placement.value = null;
  },
});
onMounted(() => {
  clientMounted.value = true;
  syncMounted();
  // Nothing is mounted on the server or in the first client render, so the markup matches.
  if (ctx.open.value) presence.setOpen(true);
});
watch(
  ctx.open,
  (open) => {
    presence.setOpen(open);
    syncMounted();
  },
  { flush: 'post' },
);
onBeforeUnmount(() => {
  presence.destroy();
});

const handlers = {
  escapeKeyDown: (event: KeyboardEvent) => {
    emit('escapeKeyDown', event);
  },
  pointerDownOutside: (event: PointerDownOutsideEvent) => {
    emit('pointerDownOutside', event);
  },
};

// While the list is open: the dismiss layer. It starts after the list is in the document.
watch(
  [ctx.open, ctx.contentElement],
  ([open, element], _previous, onCleanup) => {
    if (!open || !element) return;
    // Escape and a press outside are asked inside the layer walk, so a refusal keeps the layers below open. The
    // press logic is the CDK's.
    const { layer, stop } = createTriggerDismissLayer({
      trigger: () => ctx.triggerElement.value,
      inside: () => [ctx.triggerElement.value, ctx.anchorElement.value, ctx.contentElement.value],
      parent: () => parentLayer?.value ?? null,
      escape: (intent) => {
        if (dismissRefused(intent, handlers)) return false;
        ctx.send({ type: 'LIST.DISMISS', reason: 'escape', event: intent.event });
        return true;
      },
      press: (intent, focusLeft) => {
        if (dismissRefused(intent, handlers)) return false;
        ctx.send({ type: 'LIST.DISMISS', reason: 'outside-press', event: intent.event, focusLeft });
        return true;
      },
      holdFocusOut: ctx.holdFocusOut,
    });
    ownLayer.value = layer;
    ctx.layerActive.value = true;
    onCleanup(() => {
      stop();
      ownLayer.value = null;
      ctx.layerActive.value = false;
    });
  },
  { flush: 'post' },
);

const positioning = useOverlayPositioning(props, (hidden) => {
  anchorHidden.value = hidden;
});

// Positioning restarts when the wanted side or alignment, the anchor or a positioning option changes. An unset
// option is not passed, so the positioning defaults apply.
watch(
  [ctx.open, ctx.contentElement, ctx.anchorElement, () => props.side, () => props.align, ...positioning.sources],
  ([open, element, anchor, side, align], _previous, onCleanup) => {
    if (!open || !element) return;
    onCleanup(
      startOverlayPosition({
        getAnchor: () => anchor ?? ctx.triggerElement.value,
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
    onCleanup(() => {
      anchorHidden.value = false;
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
