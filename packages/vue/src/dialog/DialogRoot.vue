<script setup lang="ts">
import { computed, provide, shallowRef, useId, watch } from 'vue';
import { transitionDialog, type DialogEvent } from '@cocokits/machines/dialog';
import { DIALOG_KEY } from './dialog.context';
import { liveElementRef } from '../internal/live-element';
import { useDefaultModel } from '../internal/use-default-model';
import type { DialogRootEmits, DialogRootProps } from './dialog.types';

defineOptions({ name: 'CckDialogRoot', inheritAttrs: false });

const props = withDefaults(defineProps<DialogRootProps>(), {
  open: undefined,
  defaultOpen: false,
  modal: true,
  unmountOnHide: true,
});
defineEmits<DialogRootEmits>();
defineSlots<{
  /**
   * The parts of the dialog: a trigger and the content. The slot gives you the open state and a close function. When
   * not set, the dialog has no parts.
   *
   * The root renders no element around them.
   *
   * @example
   * <DialogRoot #default="{ close }">
   *   <DialogTrigger>Delete project</DialogTrigger>
   *   <DialogContent>
   *     <DialogTitle>Delete project</DialogTitle>
   *     <button type="button" @click="remove(); close()">Delete</button>
   *   </DialogContent>
   * </DialogRoot>
   */
  default?(props: {
    /**
     * Whether the dialog is open.
     *
     * @cckSemantic none
     * @cckParity Slot prop: the state of the root.
     */
    open: boolean;
    /**
     * Closes the dialog as `DialogClose` does, and emits `update:open` with `false`.
     *
     * @cckSemantic none
     * @cckParity Slot prop: the close function of the root.
     */
    close: () => void;
  }): unknown;
}>();

const model = useDefaultModel(props, 'open', props.defaultOpen);
const open = computed(() => model.value === true);
const id = useId();

// Whether the Trigger opened the dialog: focus goes back to it then, whatever had focus when it opened.
const openedByTrigger = shallowRef(false);
watch(open, (isOpen) => {
  if (!isOpen) openedByTrigger.value = false;
});

function send(event: DialogEvent): void {
  const next = transitionDialog({ id, open: open.value }, event);
  if (!next || next.open === open.value) return;
  openedByTrigger.value = next.open && next.reason === 'trigger';
  model.value = next.open; // emits update:open
}

// Closes the way the Close part does; the event is the one the change reports.
function close(): void {
  send({ type: 'CLOSE.CLICK', event: new Event('close') });
}

const trigger = liveElementRef();

provide(DIALOG_KEY, {
  id,
  open,
  modal: computed(() => props.modal),
  unmountOnHide: computed(() => props.unmountOnHide),
  // Nothing is mounted on the server or in the first client render, so the markup matches.
  mounted: shallowRef(false),
  openedByTrigger,
  titles: shallowRef(0),
  descriptions: shallowRef(0),
  triggerElement: trigger.element,
  followTrigger: trigger.follow,
  contentElement: shallowRef(null),
  send,
});
</script>

<template>
  <slot :open="open" :close="close" />
</template>
