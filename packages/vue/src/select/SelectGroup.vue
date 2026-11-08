<script setup lang="ts">
import { computed, mergeProps, provide, useAttrs, useId } from 'vue';
import { selectAnatomy } from '@cocokits/machines/select';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { omit } from '../internal/record';
import { SELECT_GROUP_KEY, useSelectContext } from './select.context';
import type { SelectGroupProps } from './select-list.types';

defineOptions({ name: 'CckSelectGroup', inheritAttrs: false });

const props = withDefaults(defineProps<SelectGroupProps>(), { disabled: false, as: 'div', asChild: false });
defineSlots<{
  /**
   * The group: a `SelectLabel`, then its `SelectItem` elements. When not set, the group is empty.
   *
   * @example
   * <SelectGroup>
   *   <SelectLabel>Hot dishes</SelectLabel>
   *   <SelectItem value="soup">
   *     <SelectItemText>Soup</SelectItemText>
   *   </SelectItem>
   * </SelectGroup>
   */
  default?(): unknown;
}>();

const ctx = useSelectContext<unknown>('SelectGroup');
const themeAttrs = useThemeAttrs(selectAnatomy);
const attrs = useAttrs();
const key = useId();
const disabled = computed(() => props.disabled);
const machine = computed(() => ctx.parts.value.optionGroup({ key, disabled: disabled.value }));
provide(SELECT_GROUP_KEY, { key, disabled });

// The machine's attributes are reserved: they replace the same attribute of the author.
const bound = computed(() =>
  mergeProps(
    themeAttrs.value.optionGroup,
    omit(attrs, 'role', 'aria-labelledby', 'aria-disabled', 'data-disabled'),
    omit(machine.value, 'class'),
    { class: [machine.value.class, attrs.class] },
  ),
);
// The machine's attributes win over an `asChild` child's own props.
const priorityAttrs = computed(() => Object.keys(omit(machine.value, 'class')));
</script>

<template>
  <Primitive v-bind="bound" :as="as" :as-child="asChild" :priority-attrs="priorityAttrs">
    <slot />
  </Primitive>
</template>
