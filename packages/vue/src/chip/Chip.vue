<script setup lang="ts">
import { computed, h, useAttrs, useId, useSlots, useTemplateRef, type ComponentPublicInstance, type VNode } from 'vue';
import { chipAnatomy, getChipProps } from '@cocokits/machines/chip';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { Nodes } from '../internal/own-content';
import { omit } from '../internal/record';
import { rootElementOf } from '../internal/root-element';
import { usePartIcon } from '../internal/use-part-icon';
import { SvgIcon } from '../svg-icon';
import type { ChipEmits, ChipProps } from './chip.types';

defineOptions({ name: 'CckChip', inheritAttrs: false });

// A Boolean prop that is absent would be `false`; the machine reads `undefined` as `false` too.
const props = withDefaults(defineProps<ChipProps>(), {
  id: undefined,
  removable: undefined,
  disabled: undefined,
  as: 'div',
  asChild: false,
});
const emit = defineEmits<ChipEmits>();

defineSlots<{
  /**
   * The text of the chip. It sits in the content wrapper, which names the remove button. When not set, the chip is
   * empty.
   *
   * @example
   * <Chip removable @remove="remove('Pizza')">Pizza</Chip>
   */
  default?(): unknown;
}>();

const slots: { default?: () => VNode[] } = useSlots();
const attrs = useAttrs();
const generatedId = useId();
const themeAttrs = useThemeAttrs(chipAnatomy);
const removeIcon = usePartIcon(chipAnatomy.block, 'remove');
const parts = computed(() =>
  getChipProps({ id: props.id ?? generatedId, removable: props.removable, disabled: props.disabled }),
);

/** The attrs are not reactive, so the template reads them through a function. The machine's facts win. */
const rootBound = (): Record<string, unknown> => ({
  ...omit(attrs, 'class', 'id', 'data-disabled'),
  ...themeAttrs.value.root,
  ...omit(parts.value.root, 'class'),
  class: [parts.value.root.class, attrs.class],
});

/** The remove button, a native button; a disabled chip never gets here, but the guard keeps the promise. */
function onRemove(): void {
  if (props.disabled !== true) emit('remove');
}

/** The text wrapper and the remove button, written once for both renderings. */
function tree(content: VNode[] = []): VNode[] {
  const { contentWrapper, remove } = parts.value;
  return [
    h('span', { ...themeAttrs.value.contentWrapper, ...contentWrapper }, content),
    ...(remove
      ? [
          h('button', { ...themeAttrs.value.remove, ...remove, onClick: onRemove }, [
            h(SvgIcon, { iconName: removeIcon.value }),
          ]),
        ]
      : []),
  ];
}

const root = useTemplateRef<ComponentPublicInstance>('root');

defineExpose({
  /**
   * The DOM element of the root: the `<div>`, or the element of the `as` component or the `asChild` child. It is
   * `null` before mount.
   *
   * @example
   * <Chip ref="chip">Pizza</Chip>
   * <!-- In the script: const chip = useTemplateRef('chip'); then chip.value?.element is the root. -->
   *
   * @cckSemantic none
   * @cckParity Templates reach the DOM node through the component ref.
   */
  get element(): Element | null {
    return rootElementOf(root.value);
  },
});
</script>

<template>
  <Primitive
    ref="root"
    v-bind="rootBound()"
    :as="as"
    :as-child="asChild || as === 'template'"
    :priority-attrs="Object.keys(omit(parts.root, 'class'))"
    :as-child-content="tree"
  >
    <slot v-if="asChild || as === 'template'" />
    <Nodes v-else :nodes="tree(slots.default?.() ?? [])" />
  </Primitive>
</template>
