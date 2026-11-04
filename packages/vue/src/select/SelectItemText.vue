<script setup lang="ts">
import {
  computed,
  inject,
  mergeProps,
  onBeforeUnmount,
  onMounted,
  useAttrs,
  useTemplateRef,
  type ComponentPublicInstance,
} from 'vue';
import { selectAnatomy } from '@cocokits/machines/select';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { rootElementOf } from '../internal/root-element';
import { SELECT_ITEM_KEY, useSelectContext } from './select.context';
import type { SelectItemTextProps } from './select.types';

defineOptions({ name: 'CckSelectItemText', inheritAttrs: false });

withDefaults(defineProps<SelectItemTextProps>(), { as: 'span', asChild: false });
defineSlots<{
  /** The text of the item. */
  default?(): unknown;
}>();

const ctx = useSelectContext<unknown>('SelectItemText');
const item = inject(SELECT_ITEM_KEY, undefined);
const themeAttrs = useThemeAttrs(selectAnatomy);
const attrs = useAttrs();
const root = useTemplateRef<ComponentPublicInstance>('root');
const bound = computed(() => mergeProps(themeAttrs.value.optionContent, attrs, { ...ctx.parts.value.optionContent }));

// The item reads the text of this element when type-to-search needs it.
onMounted(() => {
  item?.setTextElement(rootElementOf(root.value) as HTMLElement | null);
});
onBeforeUnmount(() => {
  item?.setTextElement(null);
});
</script>

<template>
  <Primitive ref="root" v-bind="bound" :as="as" :as-child="asChild">
    <slot />
  </Primitive>
</template>
