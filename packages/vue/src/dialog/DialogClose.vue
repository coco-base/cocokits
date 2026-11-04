<script setup lang="ts">
import { computed, mergeProps, useAttrs } from 'vue';
import { dialogAnatomy, getDialogProps } from '@cocokits/machines/dialog';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { buttonPartKind, NON_NATIVE_DEFAULTS, nonNativePress, typedForKind } from '../internal/button-part';
import { useDialogContext } from './dialog.context';
import type { DialogCloseProps } from './dialog.types';

defineOptions({ name: 'CckDialogClose', inheritAttrs: false });

const props = withDefaults(defineProps<DialogCloseProps>(), { as: 'button', asChild: false });
defineSlots<{
  /** The content of the Close: text and icons. An icon-only Close needs `aria-label`. */
  default?(): unknown;
}>();

const ctx = useDialogContext('DialogClose');
const themeAttrs = useThemeAttrs(dialogAnatomy);
const attrs = useAttrs();
const kind = computed(() => buttonPartKind(props.as, props.asChild));
const machine = computed(
  () => getDialogProps({ id: ctx.id, open: ctx.open.value, mounted: ctx.mounted.value }, ctx.send).close,
);
// A consumer listener runs first and cannot veto the click: it is sent whatever the listener did, as in Reka UI.
// Only a native button gets `type`; another element gets the button role, a tab stop and the keys.
const bound = computed(() =>
  mergeProps(themeAttrs.value.close, kind.value === 'non-native' ? NON_NATIVE_DEFAULTS : {}, attrs, {
    ...typedForKind(kind.value, machine.value),
    ...(kind.value === 'non-native' ? nonNativePress() : {}),
    onClick: (event: Event) => {
      ctx.send({ type: 'CLOSE.CLICK', event });
    },
  }),
);
</script>

<template>
  <Primitive v-bind="bound" :as="as" :as-child="asChild">
    <slot />
  </Primitive>
</template>
