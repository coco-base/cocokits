<script setup lang="ts" generic="T extends string | number">
import { TabsRoot as BaseTabsRoot, type TabsRootEmits } from '@cocokits/vue/tabs';
import { provideThemeOptions } from '@cocokits/vue-core';
import { forwardModels } from './forward-models';
import type { TabsRootProps } from './tabs.types';

defineOptions({ name: 'TabsRoot' });

// `undefined` lets the base decide each default.
const props = withDefaults(defineProps<TabsRootProps<T>>(), {
  modelValue: undefined,
  defaultValue: undefined,
  orientation: undefined,
  activationMode: undefined,
  unmountOnHide: undefined,
  dir: undefined,
  as: undefined,
  asChild: undefined,
  variant: undefined,
  color: undefined,
  size: undefined,
  headerAlign: undefined,
});
const emit = defineEmits<TabsRootEmits<T>>();

defineSlots<{
  /** The tabs: a `TabsList` and one `TabsContent` per trigger. It receives `modelValue`. */
  default?(props: {
    /**
     * The value of the selected tab, `undefined` until a tab is selected and no value was given.
     *
     * @cckSemantic none
     * @remarks Vue-only slot prop: the model of the root, as in Reka UI.
     */
    modelValue: T | undefined;
  }): unknown;
}>();

// The base root decides between controlled, local state and `defaultValue`: it gets the model only as the consumer wrote it.
const models = forwardModels(props, {
  modelValue: (value: T) => {
    emit('update:modelValue', value);
  },
});

provideThemeOptions('tabs', () => ({
  variant: props.variant,
  color: props.color,
  size: props.size,
  headerAlign: props.headerAlign,
}));
</script>

<template>
  <BaseTabsRoot
    v-bind="models()"
    :default-value="defaultValue"
    :orientation="orientation"
    :activation-mode="activationMode"
    :unmount-on-hide="unmountOnHide"
    :dir="dir"
    :as="as"
    :as-child="asChild"
  >
    <template #default="slotProps">
      <slot v-bind="slotProps" />
    </template>
  </BaseTabsRoot>
</template>
