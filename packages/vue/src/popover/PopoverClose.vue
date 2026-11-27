<script setup lang="ts">
import { computed, mergeProps, useAttrs } from 'vue';
import { getPopoverProps, popoverAnatomy } from '@cocokits/machines/popover';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { buttonPartKind, NON_NATIVE_DEFAULTS, nonNativePress, typedForKind } from '../internal/button-part';
import { usePopoverContext } from './popover.context';
import type { PopoverCloseProps } from './popover.types';

defineOptions({ name: 'CckPopoverClose', inheritAttrs: false });

const props = withDefaults(defineProps<PopoverCloseProps>(), { as: 'button', asChild: false });
defineSlots<{
  /**
   * The content of the Close: text and icons. An icon-only Close needs `aria-label`. When not set, the Close is
   * empty and needs `aria-label`.
   *
   * @example
   * <PopoverClose aria-label="Close"><SvgIcon icon-name="close" /></PopoverClose>
   */
  default?(): unknown;
}>();

const ctx = usePopoverContext('PopoverClose');
const themeAttrs = useThemeAttrs(popoverAnatomy);
const attrs = useAttrs();
const kind = computed(() => buttonPartKind(props.as, props.asChild));
const machine = computed(
  () => getPopoverProps({ id: ctx.id, open: ctx.open.value, mounted: ctx.mounted.value }, ctx.send).close,
);
// A consumer listener runs first and cannot veto the click: it is sent whatever the listener did.
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
