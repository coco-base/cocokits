<script setup lang="ts">
import {
  computed,
  h,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  useAttrs,
  useId,
  useSlots,
  useTemplateRef,
  type ComponentPublicInstance,
  type VNode,
} from 'vue';
import { getRadioProps, radioAnatomy } from '@cocokits/machines/radio';
import { isDevelopment, Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { useDefaultModel } from '../internal/use-default-model';
import { boxTree } from '../internal/box-tree';
import { choiceInputProps, choiceRootAttrs } from '../internal/choice-attrs';
import { nonEmpty } from '../internal/form-field-context';
import { useRadioGroupContext } from '../internal/radio-group-context';
import { declaredInputAttrs, omit } from '../internal/record';
import { rootElementOf } from '../internal/root-element';
import { useCheckedState } from '../internal/use-checked-state';
import type { RadioEmits, RadioProps } from './radio.types';

defineOptions({ name: 'CckRadio', inheritAttrs: false });

const props = withDefaults(defineProps<RadioProps>(), {
  modelValue: undefined,
  defaultChecked: undefined,
  id: undefined,
  name: undefined,
  disabled: undefined,
  required: undefined,
  as: 'div',
  asChild: false,
});
defineEmits<RadioEmits>();

defineSlots<{
  /**
   * The label content: the caption of the radio. When not set, the radio has no caption and needs `aria-label` or
   * `aria-labelledby`.
   *
   * @example
   * <Radio v-model="isFree" name="plan" value="free">Free <small>for one user</small></Radio>
   */
  default?(): unknown;
}>();

const model = useDefaultModel(props, 'modelValue', props.defaultChecked);

const attrs = useAttrs();
const slots: { default?: () => VNode[] } = useSlots();
const themeAttrs = useThemeAttrs(radioAnatomy);
const generatedId = useId();
// Inside a RadioGroup the group owns the checked state, the name and the tab stop.
const group = useRadioGroupContext();
const { inputRef, participation, change } = useCheckedState({
  model,
  followGroup: true,
  grouped: group && {
    checked: () => groupFacts()?.checked === true,
    reset: group.formReset,
  },
});

const ownDisabled = (): boolean => props.disabled === true || participation.fieldsetDisabled.value;
const ownForm = (): string | undefined => {
  const { form } = attrs;
  return typeof form === 'string' ? form : undefined;
};

/** The facts the group gives this radio; `undefined` outside a group. */
const groupFacts = () =>
  group?.facts({
    value: props.value,
    disabled: ownDisabled(),
    required: props.required === true,
    form: ownForm(),
  });

const parts = computed(() => {
  const facts = groupFacts();
  return getRadioProps({
    checked: facts ? facts.checked : model.value,
    id: nonEmpty(props.id) ?? generatedId,
    name: facts ? facts.name : props.name,
    disabled: facts ? facts.disabled === true : ownDisabled(),
    required: facts ? facts.required === true : props.required,
    tabIndex: facts?.tabIndex,
  });
});

let unregister: (() => void) | undefined;
onMounted(() => {
  if (!isDevelopment()) return;
  if (group && props.value === undefined) {
    console.warn('CocoKits: a Radio in a RadioGroup has no value, so it can never be checked. Give it a value.');
  } else if (!group && !inputRef.value?.name) {
    console.warn('CocoKits: a Radio has no name, so it has no group mate. Give every radio of a group the same name.');
  }
});
onMounted(() => {
  unregister = group?.register({
    value: () => props.value,
    disabled: ownDisabled,
    required: () => props.required === true,
    form: ownForm,
    element: () => inputRef.value,
    sync: participation.syncValue,
  });
});
onUpdated(() => {
  group?.refresh();
});
onBeforeUnmount(() => {
  unregister?.();
  unregister = undefined;
});

/** `tabIndex` is a DOM property name; the attribute is what the server renders. */
function withTabindex(input: { readonly class: string; readonly tabIndex?: number | undefined }): {
  readonly class: string;
  readonly [attribute: string]: unknown;
} {
  return { ...omit(input, 'tabIndex'), class: input.class, tabindex: input.tabIndex };
}
// The attrs are not reactive, so the template reads them through functions.
const rootAttrs = (): Record<string, unknown> => choiceRootAttrs(attrs, themeAttrs.value.root, parts.value.root);
const inputProps = (): Record<string, unknown> =>
  choiceInputProps(attrs, {
    theme: themeAttrs.value.input,
    // In a group the input takes the group's `form` when it has none of its own.
    declared: { ...declaredInputAttrs(props), ...(group ? { form: groupFacts()?.form } : {}) },
    machine: group ? withTabindex(parts.value.input) : parts.value.input,
    // A radio has no invalid or read-only state of its own (the group owns them).
    reserved: ['aria-invalid', 'aria-readonly'],
    own: {
      ref: inputRef,
      onChange: (event: Event) => {
        if (group) group.userChecked(props.value);
        else change((event.target as HTMLInputElement).checked);
      },
    },
  });

/** The box and the label, written once for both renderings. */
function tree(content: VNode[] = []): VNode[] {
  return [boxTree(parts.value, themeAttrs.value, h('input', inputProps()), content)];
}
/** Renders nodes made in the parent's render, so a changed slot re-renders them. */
const Nodes = (nodeProps: { nodes: VNode[] }): VNode[] => nodeProps.nodes;

const root = useTemplateRef<ComponentPublicInstance>('root');

defineExpose({
  /**
   * The DOM element of the root: the `<div>`, or the element of the `as` component or the `asChild` child. It is
   * `null` before mount.
   *
   * @example
   * <Radio ref="free" v-model="isFree" name="plan" value="free">Free</Radio>
   * <!-- In the script: const free = useTemplateRef('free'); then free.value?.element is the root. -->
   *
   * @cckSemantic none
   * @cckParity Templates reach the DOM node through the component ref.
   */
  get element(): Element | null {
    return rootElementOf(root.value);
  },
  /**
   * The native `<input>`. It is `null` before mount.
   *
   * @example
   * <Radio ref="free" v-model="isFree" name="plan" value="free">Free</Radio>
   * <!-- In the script: const free = useTemplateRef('free'); then free.value?.inputElement?.focus(). -->
   *
   * @cckSemantic none
   * @cckParity Templates reach the DOM node through the component ref.
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
