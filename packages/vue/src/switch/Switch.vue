<script setup lang="ts">
import { h, type ComponentPublicInstance, type VNode, useSlots, useTemplateRef } from 'vue';
import { getSwitchProps, switchAnatomy } from '@cocokits/machines/switch';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { useDefaultModel } from '../internal/use-default-model';
import { rootElementOf } from '../internal/root-element';
import { useCheckControl } from '../internal/use-check-control';
import type { SwitchEmits, SwitchProps } from './switch.types';

defineOptions({ name: 'CckSwitch', inheritAttrs: false });

// A Boolean prop that is absent would be `false`; `undefined` lets a given `touched`, `dirty` or `submitted` win.
const props = withDefaults(defineProps<SwitchProps>(), {
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
});
defineEmits<SwitchEmits>();

defineSlots<{
  /**
   * The label content: the caption of the switch. When not set, the switch has no caption and needs `aria-label` or
   * `aria-labelledby`.
   *
   * @example
   * <Switch v-model="notify">Email notifications</Switch>
   */
  default?(): unknown;
}>();

const model = useDefaultModel(props, 'modelValue', props.defaultChecked);

const slots: { default?: () => VNode[] } = useSlots();
const themeAttrs = useThemeAttrs(switchAnatomy);
const { parts, inputRef, labelRef, rootAttrs, inputProps } = useCheckControl(props, {
  componentName: 'Switch',
  model,
  rootThemeAttrs: () => themeAttrs.value.root,
  inputThemeAttrs: () => themeAttrs.value.input,
  getParts: getSwitchProps,
  // The track holds the input and the decoration, not the caption.
  ignoredLabelNodes: (label) => [...label.querySelectorAll(`.${switchAnatomy.classes.track}`)],
});

/** The label with the track and the content, written once for both renderings. */
function tree(content: VNode[] = []): VNode[] {
  const { track, thumb, backdrop, label } = parts.value;
  const theme = themeAttrs.value;
  return [
    h('label', { ...theme.label, ...label, ref: labelRef }, [
      h('span', { ...theme.track, class: track.class }, [
        h('input', inputProps()),
        h('span', { ...theme.thumb, ...thumb }),
        h('span', { ...theme.backdrop, ...backdrop }),
      ]),
      ...content,
    ]),
  ];
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
   * <Switch ref="notifications" v-model="notify">Email notifications</Switch>
   * <!-- In the script: const notifications = useTemplateRef('notifications'); then notifications.value?.element is the root. -->
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
   * <Switch ref="notifications" v-model="notify">Email notifications</Switch>
   * <!-- In the script: const notifications = useTemplateRef('notifications'); then notifications.value?.inputElement?.focus(). -->
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
