<script setup lang="ts">
import { useTemplateRef, type ComponentPublicInstance } from 'vue';
import { getIconButtonProps, iconButtonAnatomy } from '@cocokits/machines/icon-button';
import { Primitive } from '@cocokits/vue-core';
import { useButton } from '../internal/use-button';
import { useUnnamedWarning } from '../internal/use-unnamed-warning';
import type { IconButtonProps } from './icon-button.types';

defineOptions({ name: 'CckIconButton', inheritAttrs: false });

const props = withDefaults(defineProps<IconButtonProps>(), { disabled: undefined, as: 'button', asChild: false });

defineSlots<{
  /**
   * The icon of the button: a `SvgIcon`, or your own decorative `<svg aria-hidden="true">`. No text. The button
   * has no name of its own, so give it an `aria-label` or an `aria-labelledby`; in development a missing name
   * logs a `CocoKits:` error.
   *
   * @example
   * <IconButton aria-label="Add item"><SvgIcon icon-name="plus" /></IconButton>
   *
   * @cckSemantic icon-button.default
   */
  default?(): unknown;
}>();

const root = useTemplateRef<ComponentPublicInstance>('root');
const { className, type, priorityAttrs, boundAttrs, guard, element } = useButton({
  name: 'IconButton',
  anatomy: iconButtonAnatomy,
  getProps: getIconButtonProps,
  props,
  root,
});
useUnnamedWarning(
  'IconButton',
  {
    get value() {
      return element();
    },
  },
  {
    level: 'error',
    fix: 'Add an aria-label or an aria-labelledby that points to an element with text, or put a SvgIcon with a label inside.',
  },
);

defineExpose({
  /**
   * The DOM element of the IconButton: the `<button>`, the `<a>` or the element of the `as` component. It is
   * `null` before mount.
   *
   * @example
   * <IconButton ref="add" aria-label="Add item"><SvgIcon icon-name="plus" /></IconButton>
   * <!-- In the script: const add = useTemplateRef('add'); then add.value?.element is the element. -->
   *
   * @cckSemantic none
   * @cckParity Templates reach the DOM node through the component ref.
   */
  get element(): Element | null {
    return element();
  },
});
</script>

<template>
  <Primitive
    ref="root"
    v-bind="boundAttrs()"
    :as="as"
    :as-child="asChild"
    :priority-attrs="priorityAttrs"
    :class="className"
    :type="type"
    @click.capture="guard"
  >
    <slot />
  </Primitive>
</template>
