<script setup lang="ts">
import { computed, mergeProps, provide, shallowRef, useAttrs, useId } from 'vue';
import { getMenuProps, menuAnatomy } from '@cocokits/machines/menu';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { omit } from '../internal/record';
import { useDefaultModel } from '../internal/use-default-model';
import { MENU_GROUP_KEY, MENU_RADIO_GROUP_KEY, useMenuContext } from './menu.context';
import type { MenuRadioGroupEmits, MenuRadioGroupProps } from './menu-parts.types';

defineOptions({ name: 'CckMenuRadioGroup', inheritAttrs: false });

const props = withDefaults(defineProps<MenuRadioGroupProps>(), {
  modelValue: undefined,
  defaultValue: undefined,
  as: 'div',
  asChild: false,
});
defineEmits<MenuRadioGroupEmits>();
defineSlots<{
  /**
   * The radio items, and a `MenuGroupLabel` that names the group. When not set, the group is empty.
   *
   * @example
   * <MenuRadioGroup v-model="sort">
   *   <MenuGroupLabel>Sort by</MenuGroupLabel>
   *   <MenuRadioItem value="name">Name</MenuRadioItem>
   * </MenuRadioGroup>
   */
  default?(): unknown;
}>();

const ctx = useMenuContext('MenuRadioGroup');
const themeAttrs = useThemeAttrs(menuAnatomy);
const attrs = useAttrs();
const id = useId();
const labels = shallowRef(0);
const model = useDefaultModel(props, 'modelValue', props.defaultValue);
const machine = computed(() => getMenuProps(ctx.state.value, ctx.send).radioGroup({ id, hasLabel: labels.value > 0 }));

provide(MENU_RADIO_GROUP_KEY, {
  value: computed(() => model.value),
  set: (value) => {
    model.value = value; // emits update:modelValue
  },
});
provide(MENU_GROUP_KEY, {
  id,
  label: () => {
    labels.value += 1;
    return () => {
      labels.value -= 1;
    };
  },
});

// The machine's attributes are reserved: they replace the same attribute of the author.
const bound = computed(() =>
  mergeProps(themeAttrs.value.radioGroup, omit(attrs, 'role', 'aria-labelledby'), { ...machine.value }),
);
const priorityAttrs = ['role', 'aria-labelledby'];
</script>

<template>
  <Primitive v-bind="bound" :as="as" :as-child="asChild" :priority-attrs="priorityAttrs">
    <slot />
  </Primitive>
</template>
