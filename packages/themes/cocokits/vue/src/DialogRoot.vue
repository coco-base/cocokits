<script setup lang="ts">
import { provide } from 'vue';
import { DialogRoot as BaseDialogRoot, type DialogRootEmits } from '@cocokits/vue/dialog';
import { forwardModels } from './forward-models';
import { dialogThemeKey } from './theme-keys';
import type { DialogRootProps } from './dialog.types';

defineOptions({ name: 'DialogRoot' });

// `undefined` lets the base decide each default.
const props = withDefaults(defineProps<DialogRootProps>(), {
  open: undefined,
  defaultOpen: undefined,
  modal: undefined,
  unmountOnHide: undefined,
  role: undefined,
  disableClose: undefined,
  closePredicate: undefined,
  autoFocus: undefined,
  restoreFocus: undefined,
  closeOnNavigation: undefined,
  width: undefined,
  height: undefined,
  minWidth: undefined,
  minHeight: undefined,
  maxWidth: undefined,
  maxHeight: undefined,
  size: undefined,
});
const emit = defineEmits<DialogRootEmits>();

defineSlots<{
  /** The parts of the dialog: a trigger and the content. It receives `open` and `close`. */
  default?(props: {
    /**
     * Whether the dialog is open.
     *
     * @cckSemantic none
     * @remarks Slot prop: the open state of the root.
     */
    open: boolean;
    /**
     * Closes the dialog and emits `update:open` with `false`.
     *
     * @cckSemantic none
     * @remarks Slot prop: the close function of the root.
     */
    close: () => void;
  }): unknown;
}>();

// The base decides between controlled, local state and the start value: it gets the model only as the consumer wrote it.
const models = forwardModels(props, {
  open: (value: boolean) => {
    emit('update:open', value);
  },
});

// The root renders no element and no attribute: its `DialogContent` reads the size and draws it.
provide(dialogThemeKey, () => ({ size: props.size }));
</script>

<template>
  <BaseDialogRoot
    v-bind="models()"
    :default-open="defaultOpen"
    :modal="modal"
    :unmount-on-hide="unmountOnHide"
    :role="role"
    :disable-close="disableClose"
    :close-predicate="closePredicate"
    :auto-focus="autoFocus"
    :restore-focus="restoreFocus"
    :close-on-navigation="closeOnNavigation"
    :width="width"
    :height="height"
    :min-width="minWidth"
    :min-height="minHeight"
    :max-width="maxWidth"
    :max-height="maxHeight"
  >
    <template #default="slotProps">
      <slot v-bind="slotProps" />
    </template>
  </BaseDialogRoot>
</template>
