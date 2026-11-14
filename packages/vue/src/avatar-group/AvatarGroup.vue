<script setup lang="ts">
import { computed, useTemplateRef, type ComponentPublicInstance } from 'vue';
import { avatarGroupAnatomy, getAvatarGroupProps } from '@cocokits/machines/avatar-group';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { rootElementOf } from '../internal/root-element';
import type { AvatarGroupProps } from './avatar-group.types';

defineOptions({ name: 'CckAvatarGroup' });

withDefaults(defineProps<AvatarGroupProps>(), { as: 'div', asChild: false });
defineSlots<{
  /**
   * The avatars of the group, each a direct child. When not set, the group is empty.
   *
   * @example
   * <AvatarGroup>
   *   <AvatarRoot><AvatarFallback>AL</AvatarFallback></AvatarRoot>
   *   <AvatarRoot><AvatarFallback>GH</AvatarFallback></AvatarRoot>
   * </AvatarGroup>
   */
  default?(): unknown;
}>();

const themeAttrs = useThemeAttrs(avatarGroupAnatomy);
const parts = computed(() => getAvatarGroupProps());
const root = useTemplateRef<ComponentPublicInstance>('root');

defineExpose({
  /**
   * The DOM element of the AvatarGroup: the `<div>`, or the element of the `as` component or the `asChild` child. It
   * is `null` before mount.
   *
   * @example
   * <AvatarGroup ref="group">...</AvatarGroup>
   * <!-- In the script: const group = useTemplateRef('group'); then group.value?.element is the element. -->
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
  <Primitive ref="root" :as="as" :as-child="asChild" v-bind="{ ...themeAttrs.root, ...parts.root }"><slot /></Primitive>
</template>
