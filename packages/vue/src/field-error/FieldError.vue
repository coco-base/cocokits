<script setup lang="ts">
import { computed, useTemplateRef, type ComponentPublicInstance, type VNode } from 'vue';
import { fieldErrorAnatomy, getFieldErrorProps } from '@cocokits/machines/field-error';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { useFormFieldState } from '../internal/form-field-context';
import { rootElementOf } from '../internal/root-element';
import type { FieldErrorProps } from './field-error.types';

defineOptions({ name: 'CckFieldError' });

const props = withDefaults(defineProps<FieldErrorProps>(), { as: 'div', asChild: false, force: false });

defineSlots<{
  /** The message. Keep it cheap: it is created on every render of the owner, and rendered only while shown. */
  default?(): unknown;
}>();

const state = useFormFieldState();
const themeAttrs = useThemeAttrs(fieldErrorAnatomy);
const parts = computed(() => getFieldErrorProps({ force: props.force, state: state?.value }));

/** With `asChild`, the child keeps its place and attributes; its own children are the message, shown or not. */
function messageOf(hostChildren: VNode[] = []): VNode[] {
  return parts.value.shown ? hostChildren : [];
}

const root = useTemplateRef<ComponentPublicInstance>('root');

defineExpose({
  /**
   * The DOM element of the FieldError: the `<div>`, or the element of the `as` component or `asChild` child.
   * `null` before mount.
   *
   * @cckSemantic none
   * @cckParity Vue-only member: templates reach the DOM node through the component ref.
   */
  get element(): Element | null {
    return rootElementOf(root.value);
  },
});
</script>

<template>
  <!-- The root stays rendered (a live region exists before its text appears); only the message is gated. -->
  <Primitive
    ref="root"
    :as="as"
    :as-child="asChild"
    :as-child-content="messageOf"
    v-bind="{ ...themeAttrs.root, ...parts.root }"
    ><slot v-if="asChild || parts.shown"
  /></Primitive>
</template>
