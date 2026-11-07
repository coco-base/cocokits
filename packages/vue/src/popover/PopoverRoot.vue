<script setup lang="ts">
import { computed, provide, shallowRef, useId } from 'vue';
import { transitionPopover, type PopoverEvent } from '@cocokits/machines/popover';
import { POPOVER_KEY } from './popover.context';
import { liveElementRef } from '../internal/live-element';
import { useDefaultModel } from '../internal/use-default-model';
import type { PopoverRootEmits, PopoverRootProps } from './popover.types';

defineOptions({ name: 'CckPopoverRoot', inheritAttrs: false });

const props = withDefaults(defineProps<PopoverRootProps>(), { open: undefined, defaultOpen: false, modal: false });
defineEmits<PopoverRootEmits>();
defineSlots<{
  /**
   * The parts of the popover: a trigger, the content and a Close. The root renders no element around them. It
   * receives `open` and `close`.
   */
  default?(props: {
    /**
     * Whether the popover is open.
     *
     * @cckSemantic none
     * @cckParity Slot prop: the state of the root.
     */
    open: boolean;
    /**
     * Closes the popover the way `PopoverClose` does and emits `update:open` with `false`.
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

function send(event: PopoverEvent): void {
  const next = transitionPopover({ id, open: open.value }, event);
  if (!next || next.open === open.value) return;
  model.value = next.open; // emits update:open
}

// Closes the way the Close part does; the event is the one the change reports.
function close(): void {
  send({ type: 'CLOSE.CLICK', event: new Event('close') });
}

const trigger = liveElementRef();

provide(POPOVER_KEY, {
  id,
  open,
  modal: computed(() => props.modal),
  // Nothing is mounted on the server or in the first client render, so the markup matches.
  mounted: shallowRef(false),
  titles: shallowRef(0),
  descriptions: shallowRef(0),
  anchor: shallowRef(null),
  triggerElement: trigger.element,
  followTrigger: trigger.follow,
  contentElement: shallowRef(null),
  arrowElement: shallowRef(null),
  arrowHidden: shallowRef(false),
  send,
});
</script>

<template>
  <slot :open="open" :close="close" />
</template>
