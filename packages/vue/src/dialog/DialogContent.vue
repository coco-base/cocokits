<script setup lang="ts">
import {
  computed,
  getCurrentInstance,
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
import { createDismissLayer, type DismissIntent, type DismissLayer } from '@cocokits/cdk/dismissal';
import { captureFocusReturn, deepActiveElement, scheduleFocus, type FocusReturn } from '@cocokits/cdk/focus';
import { createPresence } from '@cocokits/cdk/presence';
import { lockScroll } from '@cocokits/cdk/scroll-lock';
import { dialogAnatomy, getDialogProps } from '@cocokits/machines/dialog';
import { containsDeep, hasAccessibleName } from '@cocokits/utils';
import {
  isDevelopment,
  Portal,
  Primitive,
  useThemeAttrs,
  type FocusOutsideEvent,
  type PointerDownOutsideEvent,
} from '@cocokits/vue-core';
import { dismissRefused } from '../internal/dismiss-handlers';
import { DISMISS_LAYER_KEY } from '../internal/dismiss-layer';
import { rootElementOf } from '../internal/root-element';
import { useDialogContext } from './dialog.context';
import type { DialogContentEmits, DialogContentProps } from './dialog.types';

defineOptions({ name: 'CckDialogContent', inheritAttrs: false });

const props = withDefaults(defineProps<DialogContentProps>(), { forceMount: false });
defineSlots<{
  /**
   * The content of the dialog: a `DialogTitle`, a `DialogDescription`, the body and `DialogClose` buttons. When not
   * set, the dialog is empty.
   *
   * @example
   * <DialogContent>
   *   <DialogTitle>Delete project</DialogTitle>
   *   <DialogDescription>This cannot be undone.</DialogDescription>
   *   <DialogClose>Cancel</DialogClose>
   * </DialogContent>
   */
  default?(): unknown;
}>();

const emit = defineEmits<DialogContentEmits>();

const ctx = useDialogContext('DialogContent');
const instance = getCurrentInstance();
const themeAttrs = useThemeAttrs(dialogAnatomy);
const attrs = useAttrs();

// Whether the content is gone from the document as far as the open state goes: no exit animation is running.
const presenceGone = shallowRef(true);
// Whether the client rendered the component: the server and the first client render hold no content.
const clientMounted = shallowRef(false);
// The closed content stays in the document, as a `dialog` that is not open.
const keepMounted = computed(() => props.forceMount || !ctx.unmountOnHide.value);
function syncMounted(): void {
  ctx.mounted.value = !presenceGone.value || (keepMounted.value && clientMounted.value);
}
watch(keepMounted, syncMounted);
// How the dialog was opened: a change of `modal` while it is open takes effect at the next open.
let openedModal = true;
// Set when a press or focus outside closes a non-modal dialog: focus stays where the user put it.
let leftOutside = false;

const machine = computed(
  () =>
    getDialogProps(
      {
        id: ctx.id,
        open: ctx.open.value,
        mounted: ctx.mounted.value,
        hasTitle: ctx.titles.value > 0,
        hasDescription: ctx.descriptions.value > 0,
      },
      ctx.send,
    ).content,
);
// The platform closed the dialog (a `<form method="dialog">`). A parent that refuses the change keeps it open.
function onClose(event: Event): void {
  machine.value.onClose(event);
  const dialog = ctx.contentElement.value;
  if (!dialog) return;
  scheduleFocus(dialog.ownerDocument, () => {
    if (!ctx.open.value || !dialog.isConnected || dialog.open) return;
    if (openedModal) dialog.showModal();
    else dialog.show();
  });
}
const bound = computed(() => mergeProps(themeAttrs.value.content, attrs, { ...machine.value, onClose }));
const priorityAttrs = ['id', 'data-state'];

function setContent(instance: unknown): void {
  ctx.contentElement.value = rootElementOf(instance as ComponentPublicInstance | null) as HTMLDialogElement | null;
}

// A dialog or popover opened inside this one registers as its child layer.
const parentLayer = inject(DISMISS_LAYER_KEY, undefined);
const ownLayer = shallowRef<DismissLayer | null>(null);
provide(DISMISS_LAYER_KEY, ownLayer);

// A dialog has no focus-out and no outside focus: the keys and the backdrop press are its causes.
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

/** A refused press on the backdrop leaves focus in the dialog; if the browser moved it out, it goes back. */
function keepFocusInside(dialog: HTMLDialogElement): void {
  const doc = dialog.ownerDocument;
  const had = deepActiveElement(doc);
  if (!had || !containsDeep(dialog, had)) return;
  scheduleFocus(doc, () => {
    const now = deepActiveElement(doc);
    if (ctx.open.value && had.isConnected && (!now || !containsDeep(dialog, now))) (had as HTMLElement).focus();
  });
}

/** What a dismiss intent does: a modal ignores focus-out; a refusal keeps the dialog open; a non-modal one leaves focus. */
function onDismiss(intent: DismissIntent, modal: boolean, dialog: HTMLDialogElement): void {
  if (modal && intent.reason === 'focus-out') return;
  if (modal && intent.reason === 'outside-press') keepFocusInside(dialog);
  if (dismissRefused(intent, handlers)) return;
  leftOutside = !modal && intent.reason !== 'escape';
  // Focus moving outside is reported as an outside press: the machine knows no other outside cause.
  const reason = intent.reason === 'focus-out' ? 'outside-press' : intent.reason;
  ctx.send({ type: 'CONTENT.DISMISS', reason, event: intent.event });
}

/** The dismiss layer and the scroll lock outlive `open`: they end when the closed modal has left the document. */
let heldLayer: DismissLayer | null = null;
let unlock: (() => void) | null = null;
function releaseModal(): void {
  heldLayer?.destroy();
  heldLayer = null;
  ownLayer.value = null;
  opener.value = null;
  unlock?.();
  unlock = null;
}

// Where focus goes back to: the Trigger that opened the dialog, else the element that has focus before the content attaches. An open that comes while the
// closed dialog is still exiting keeps the first one.
let openerReturn: FocusReturn | null = null;
// The element that had focus when the dialog opened. A dialog without a trigger finds its container from it.
const opener = shallowRef<Element | null>(null);
/** The document of the dialog: the trigger's, else the one the component sits in (the Teleport leaves a node there). */
function ownerDocument(): Document {
  const anchor = instance?.proxy?.$el as Node | null | undefined;
  return ctx.triggerElement.value?.ownerDocument ?? anchor?.ownerDocument ?? document;
}
function makeOpener(): void {
  const doc = ownerDocument();
  opener.value = deepActiveElement(doc);
  openerReturn = captureFocusReturn({
    getTrigger: () => ctx.triggerElement.value,
    getContent: () => ctx.contentElement.value,
    document: doc,
    restoreTo: ctx.openedByTrigger.value ? 'trigger' : 'opener',
  });
}
function captureOpener(): void {
  if (presenceGone.value) makeOpener();
}
watch(
  ctx.open,
  (open) => {
    if (open) captureOpener();
  },
  { flush: 'pre' },
);

/** Focus goes back to the opener once the closed dialog has left the document (it is inert until then). */
let pendingReturn: { readonly doc: Document; readonly focusReturn: FocusReturn } | null = null;
function flushFocusReturn(): void {
  const pending = pendingReturn;
  if (!pending) return;
  pendingReturn = null;
  // A frame later, so the removal of the dialog and the blur of a press have settled.
  scheduleFocus(pending.doc, () => {
    if (ctx.open.value) return;
    const event = new Event('focusScope.autoFocusOnUnmount', { cancelable: true });
    emit('closeAutoFocus', event);
    if (!event.defaultPrevented && !leftOutside) pending.focusReturn.restore();
  });
}

const presence = createPresence({
  getElement: () => ctx.contentElement.value,
  onStateChange: (state) => {
    presenceGone.value = state === 'unmounted';
    syncMounted();
    if (state === 'unmounted') {
      // Content that stays in the document closes natively; the browser then hides it.
      const dialog = ctx.contentElement.value;
      if (keepMounted.value && dialog?.open) dialog.close();
      releaseModal();
      flushFocusReturn();
    }
  },
});
onMounted(() => {
  clientMounted.value = true;
  syncMounted();
  if (!ctx.open.value) return;
  // Before the content attaches, so a dialog without a trigger has its opener when the portal looks for a container.
  if (!openerReturn) makeOpener();
  presence.setOpen(true);
});
onBeforeUnmount(() => {
  presence.destroy();
  releaseModal();
});

/** Opens the native dialog the way the root asks: modal, else next to the page. */
function showNative(element: HTMLDialogElement): void {
  leftOutside = false;
  openedModal = ctx.modal.value;
  if (openedModal) element.showModal();
  else element.show();
  // The browser has placed focus in the dialog already; preventing the event only stops CocoKits from moving it.
  emit('openAutoFocus', new Event('focusScope.autoFocusOnMount', { cancelable: true }));
}

// Mount and unmount (with the exit animation), the modal state, and while the dialog is open: the dismiss layer
// (Escape, backdrop press) and the scroll lock. When it closes they only exit, and end with the modal. `presence.setOpen(false)` runs after the
// closed state is rendered.
watch(
  [ctx.open, ctx.contentElement],
  ([open, element], _previous, onCleanup) => {
    presence.setOpen(open);
    if (!element) return;
    // A reopen during the exit keeps the opener the first open captured (focus is inside the dialog now). A dialog that
    // is open from the start has no element to capture from before it renders: capture now, before the native focusing
    // steps move focus into the dialog.
    if (open && !openerReturn) {
      if (pendingReturn) {
        openerReturn = pendingReturn.focusReturn;
        pendingReturn = null;
      } else makeOpener();
    }
    if (open && element.isConnected && !element.open) showNative(element);
    if (!open) return;
    const modal = openedModal;
    const doc = element.ownerDocument;
    // After the title has labelled the content.
    const nameCheck = isDevelopment()
      ? doc.defaultView?.requestAnimationFrame(() => {
          if (!hasAccessibleName(element)) {
            console.warn(
              'CocoKits: <DialogContent> needs an accessible name: add a <DialogTitle>, or set aria-label or aria-labelledby.',
            );
          }
        })
      : undefined;
    heldLayer?.destroy();
    const layer = createDismissLayer({
      // A non-modal dialog treats its trigger as inside, like a popover: a press on it toggles.
      getInsideElements: () =>
        modal ? [ctx.contentElement.value] : [ctx.triggerElement.value, ctx.contentElement.value],
      getNativeDialog: () => ctx.contentElement.value,
      ...(modal ? {} : { dismissOn: ['escape', 'outside-press', 'focus-out'] as const }),
      onDismiss: (intent) => {
        onDismiss(intent, modal, element);
      },
      getParent: () => parentLayer?.value ?? null,
    });
    heldLayer = layer;
    ownLayer.value = layer;
    if (modal) unlock ??= lockScroll(doc);
    onCleanup(() => {
      if (nameCheck !== undefined) doc.defaultView?.cancelAnimationFrame(nameCheck);
      // The layer stops raising intents now; it stays a barrier, and the page stays locked, until the exit is over.
      layer.exit();
      // A cleanup caused by closing returns focus; one caused by the Dialog being destroyed does not.
      if (ctx.open.value) return;
      const focusReturn = openerReturn;
      openerReturn = null;
      if (focusReturn) pendingReturn = { doc, focusReturn };
      if (presenceGone.value) {
        releaseModal();
        flushFocusReturn();
      }
    });
  },
  { flush: 'post' },
);
</script>

<template>
  <Portal :open="ctx.mounted.value" :get-trigger="() => ctx.triggerElement.value ?? opener">
    <Primitive :ref="setContent" v-bind="bound" as="dialog" :priority-attrs="priorityAttrs">
      <slot />
    </Primitive>
  </Portal>
</template>
