<script setup lang="ts">
import { useTemplateRef } from 'vue';
import { AvatarGroup as BaseAvatarGroup } from '@cocokits/vue/avatar-group';
import { provideThemeOptions } from '@cocokits/vue-core';
import type { AvatarGroupProps } from './avatar-group.types';

defineOptions({ name: 'AvatarGroup' });

const props = withDefaults(defineProps<AvatarGroupProps>(), { as: undefined, asChild: undefined, size: undefined });

defineSlots<{
  /** The avatars of the group, each a direct child. */
  default?(): unknown;
}>();

const base = useTemplateRef<{ readonly element: Element | null }>('base');

defineExpose({
  /**
   * The DOM element of the AvatarGroup: the `<div>`, or the element of the `as` component or `asChild` child.
   * `null` before mount.
   *
   * @cckSemantic none
   * @remarks Templates reach the DOM node through the component ref.
   */
  get element(): Element | null {
    return base.value?.element ?? null;
  },
});

provideThemeOptions('avatar-group', () => ({ size: props.size }));
</script>

<template>
  <BaseAvatarGroup ref="base" :as="as" :as-child="asChild"><slot /></BaseAvatarGroup>
</template>
