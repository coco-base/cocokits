<script setup lang="ts">
import { computed, mergeProps, useAttrs, type ComponentPublicInstance } from 'vue';
import { dialogAnatomy, getDialogProps } from '@cocokits/machines/dialog';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { buttonPartKind, NON_NATIVE_DEFAULTS, nonNativePress, typedForKind } from '../internal/button-part';
import { idOf } from '../internal/id-of';
import { useDialogContext } from './dialog.context';
import type { DialogTriggerProps } from './dialog.types';

defineOptions({ name: 'CckDialogTrigger', inheritAttrs: false });

const props = withDefaults(defineProps<DialogTriggerProps>(), { as: 'button', asChild: false });
defineSlots<{
  /** The content of the trigger: text and icons. An icon-only trigger needs `aria-label`. */
  default?(): unknown;
}>();

const ctx = useDialogContext('DialogTrigger');
const themeAttrs = useThemeAttrs(dialogAnatomy);
const attrs = useAttrs();
const kind = computed(() => buttonPartKind(props.as, props.asChild));
const machine = computed(
  () => getDialogProps({ id: ctx.id, open: ctx.open.value, mounted: ctx.mounted.value }, ctx.send).trigger,
);
// Only a native button gets `type`; another element gets the button role, a tab stop and the keys. A consumer
// listener runs first (`mergeProps` chains it before ours) and cannot veto the click: the click is sent whatever it did.
const bound = computed(() => {
  const { id } = attrs;
  return mergeProps(themeAttrs.value.trigger, kind.value === 'non-native' ? NON_NATIVE_DEFAULTS : {}, attrs, {
    ...typedForKind(kind.value, machine.value),
    ...(kind.value === 'non-native' ? nonNativePress() : {}),
    onClick: (event: Event) => {
      // The trigger of an open modal dialog is out of reach; that of a non-modal one toggles it.
      ctx.send({ type: ctx.open.value && !ctx.modal.value ? 'CLOSE.CLICK' : 'TRIGGER.CLICK', event });
    },
    id: idOf(id, machine.value.id),
  });
});
// The state markers win over an `asChild` child's own props; its own `id` stays, like one on the part.
const priorityAttrs = ['aria-haspopup', 'aria-expanded', 'aria-controls', 'data-state'];

// A function ref hands over the instance; the element is read from it on every use, so it follows an
// `asChild` child that swaps its own root. Vue calls it with `null` on unmount.
function setTrigger(instance: unknown): void {
  ctx.followTrigger(instance as ComponentPublicInstance | null);
}
</script>

<template>
  <Primitive :ref="setTrigger" v-bind="bound" :as="as" :as-child="asChild" :priority-attrs="priorityAttrs">
    <slot />
  </Primitive>
</template>
