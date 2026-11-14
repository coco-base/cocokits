<script setup lang="ts">
import { useTemplateRef, type ComponentPublicInstance } from 'vue';
import { buttonAnatomy, getButtonProps } from '@cocokits/machines/button';
import { Primitive } from '@cocokits/vue-core';
import { useButton } from '../internal/use-button';
import type { ButtonProps } from './button.types';

defineOptions({ name: 'CckButton', inheritAttrs: false });

const props = withDefaults(defineProps<ButtonProps>(), { disabled: undefined, as: 'button', asChild: false });

defineSlots<{
  /**
   * The content of the Button: text and icons. When not set, the Button is empty and needs `aria-label` or
   * `aria-labelledby` for its name. For a Button with only an icon, use the IconButton.
   *
   * @example
   * <Button><SvgIcon icon-name="trash" /> Delete</Button>
   */
  default?(): unknown;
}>();

const root = useTemplateRef<ComponentPublicInstance>('root');
const { className, type, priorityAttrs, boundAttrs, guard, element } = useButton({
  name: 'Button',
  anatomy: buttonAnatomy,
  getProps: getButtonProps,
  props,
  root,
});

defineExpose({
  /**
   * The DOM element of the Button: the `<button>`, the `<a>` or the element of the `as` component. It is `null`
   * before mount.
   *
   * @example
   * <Button ref="button" @click="save">Save</Button>
   * <!-- In the script: const button = useTemplateRef('button'); then button.value?.element is the element. -->
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
