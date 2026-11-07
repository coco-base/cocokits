<script setup lang="ts">
import { computed, onBeforeUnmount, onUpdated, useAttrs } from 'vue';
import { getLabelProps, labelAnatomy } from '@cocokits/machines/label';
import { useThemeAttrs } from '@cocokits/vue-core';
import { nonEmpty, useFormFieldContext, useFormFieldLabelContext } from '../internal/form-field-context';
import type { LabelProps } from './label.types';

defineOptions({ name: 'CckLabel' });

const props = withDefaults(defineProps<LabelProps>(), { for: undefined });

defineSlots<{
  /**
   * The text of the label. When not set, the label is empty and the control has no visible name.
   *
   * @example
   * <Label for="email">Email address</Label>
   */
  default?(): unknown;
}>();

const field = useFormFieldLabelContext();
const control = useFormFieldContext();
const attrs = useAttrs();

// The Label's own `id` is the one the field's parts reference; without one the field's generated id is used.
const authorId = (): string | undefined => {
  const { id } = attrs;
  return nonEmpty(typeof id === 'string' ? id : undefined);
};
function share(): void {
  if (field && field.authorId.value !== authorId()) field.authorId.value = authorId();
}
share();
onUpdated(share);
onBeforeUnmount(() => {
  if (field) field.authorId.value = undefined;
});
const themeAttrs = useThemeAttrs(labelAnatomy);
const parts = computed(() =>
  getLabelProps({
    id: authorId() ?? control?.ids.value.label,
    for: nonEmpty(props.for) ?? field?.controlId.value,
    required: field?.required.value,
    hideRequiredMarker: field?.hideRequiredMarker.value,
  }),
);
const marker = computed(() => {
  const { text, ...attrs } = parts.value.requiredMarker ?? { text: undefined };
  return text === undefined ? null : { text, attrs };
});
</script>

<template>
  <label v-bind="{ ...themeAttrs.root, ...parts.root }"
    ><slot /><span v-if="marker" v-bind="{ ...themeAttrs.requiredMarker, ...marker.attrs }">{{
      marker.text
    }}</span></label
  >
</template>
