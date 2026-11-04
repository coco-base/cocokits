<script setup lang="ts">
import { h, type ComponentPublicInstance, type VNode, useSlots, useTemplateRef } from 'vue';
import { checkboxAnatomy, getCheckboxProps } from '@cocokits/machines/checkbox';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { useDefaultModel } from '../internal/use-default-model';
import { boxTree } from '../internal/box-tree';
import { rootElementOf } from '../internal/root-element';
import { useCheckControl } from '../internal/use-check-control';
import type { CheckboxEmits, CheckboxProps } from './checkbox.types';

defineOptions({ name: 'CckCheckbox', inheritAttrs: false });

// A Boolean prop that is absent would be `false`; `undefined` lets a given `touched`, `dirty` or `submitted` win.
const props = withDefaults(defineProps<CheckboxProps>(), {
  modelValue: undefined,
  defaultChecked: undefined,
  id: undefined,
  ariaDescribedby: undefined,
  name: undefined,
  disabled: undefined,
  readonly: undefined,
  required: undefined,
  invalid: undefined,
  pending: undefined,
  hidden: undefined,
  touched: undefined,
  dirty: undefined,
  submitted: undefined,
  as: 'div',
  asChild: false,
  indeterminate: false,
});
defineEmits<CheckboxEmits>();

defineSlots<{
  /** The label content: the caption of the checkbox. */
  default?(): unknown;
}>();

const model = useDefaultModel(props, 'modelValue', props.defaultChecked);

const slots: { default?: () => VNode[] } = useSlots();
const themeAttrs = useThemeAttrs(checkboxAnatomy);
const { parts, inputRef, labelRef, rootAttrs, inputProps } = useCheckControl(props, {
  componentName: 'Checkbox',
  model,
  rootThemeAttrs: () => themeAttrs.value.root,
  inputThemeAttrs: () => themeAttrs.value.input,
  getParts: (state, field) => getCheckboxProps({ ...state, indeterminate: props.indeterminate }, field),
  isMixed: () => props.indeterminate,
});

/** The box and the label, written once for both renderings. */
function tree(content: VNode[] = []): VNode[] {
  return [boxTree(parts.value, themeAttrs.value, h('input', inputProps()), content, labelRef)];
}
/** Renders nodes made in the parent's render, so a changed slot re-renders them. */
const Nodes = (nodeProps: { nodes: VNode[] }): VNode[] => nodeProps.nodes;

const root = useTemplateRef<ComponentPublicInstance>('root');

defineExpose({
  /**
   * The DOM element of the root: the `<div>`, or the element of the `as` component or `asChild` child.
   * `null` before mount.
   *
   * @cckSemantic none
   * @remarks Vue-only member: templates reach the DOM node through the component ref.
   */
  get element(): Element | null {
    return rootElementOf(root.value);
  },
  /**
   * The native `<input>`. `null` before mount.
   *
   * @cckSemantic none
   * @remarks Vue-only member: templates reach the DOM node through the component ref.
   */
  get inputElement(): HTMLInputElement | null {
    return inputRef.value;
  },
});
</script>

<template>
  <Primitive
    ref="root"
    v-bind="rootAttrs()"
    :class="parts.root.class"
    :as="as"
    :as-child="asChild || as === 'template'"
    :as-child-content="tree"
  >
    <slot v-if="asChild || as === 'template'" />
    <Nodes v-else :nodes="tree(slots.default?.() ?? [])" />
  </Primitive>
</template>
