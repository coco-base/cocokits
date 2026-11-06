<script setup lang="ts">
import { computed, mergeProps, onBeforeUpdate, useAttrs, type ComponentPublicInstance } from 'vue';
import { selectAnatomy } from '@cocokits/machines/select';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { buttonPartKind, typedForKind } from '../internal/button-part';
import { toVueListeners } from '../internal/listeners';
import { omit } from '../internal/record';
import { useSelectContext } from './select.context';
import type { SelectTriggerProps } from './select.types';

defineOptions({ name: 'CckSelectTrigger', inheritAttrs: false });

const props = withDefaults(defineProps<SelectTriggerProps>(), { as: 'button', asChild: false });
defineSlots<{
  /**
   * The content of the trigger: a `SelectValue` and a `SelectIcon`.
   */
  default?(): unknown;
}>();

const ctx = useSelectContext<unknown>('SelectTrigger');
const themeAttrs = useThemeAttrs(selectAnatomy);
const attrs = useAttrs();
const kind = computed(() => buttonPartKind(props.as, props.asChild));

// The list takes the name of the trigger, and the field's description joins the author's: the Root needs them.
const aria = (): { label?: string | undefined; labelledby?: string | undefined; describedby?: string | undefined } => ({
  label: stringOf(attrs['aria-label']),
  labelledby: stringOf(attrs['aria-labelledby']),
  describedby: stringOf(attrs['aria-describedby']),
});
function stringOf(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}
function tell(): void {
  const { label, labelledby, describedby } = aria();
  ctx.setTriggerAria({ label, labelledby, describedby });
}
tell();
onBeforeUpdate(tell);

// The machine's attributes win over the author's (they carry the author's `aria-*` already); the handlers are bound
// with the names Vue uses, and the author's listeners run first.
const bound = computed(() => {
  const machine = ctx.parts.value.trigger;
  const native = kind.value === 'native';
  return mergeProps(
    themeAttrs.value.trigger,
    kind.value === 'non-native'
      ? { tabindex: machine.disabled ? -1 : 0, 'aria-disabled': machine.disabled ? 'true' : undefined }
      : {},
    omit(attrs, 'id', 'role', 'aria-label', 'aria-labelledby', 'aria-describedby', 'aria-expanded', 'aria-controls'),
    {
      ...typedForKind(kind.value, omit(toVueListeners(machine), 'onClick', 'onKeydown', 'onKeyup', 'onBlur')),
      ...(native && ctx.form.value !== undefined ? { form: ctx.form.value } : {}),
      onClick: ctx.trigger.onClick,
      onKeydown: ctx.trigger.onKeydown,
      onKeyup: ctx.trigger.onKeyup,
      onFocus: ctx.trigger.onFocus,
      onBlur: ctx.trigger.onBlur,
    },
  );
});
// The machine's attributes win over an `asChild` child's own props.
const priorityAttrs = computed(() =>
  Object.keys(omit(ctx.parts.value.trigger, 'class', 'onClick', 'onKeyDown', 'onKeyUp', 'onBlur')),
);

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
