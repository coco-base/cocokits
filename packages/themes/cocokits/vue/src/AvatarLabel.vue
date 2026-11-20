<script setup lang="ts">
import { provide, useTemplateRef } from 'vue';
import { AvatarLabel as BaseAvatarLabel } from '@cocokits/vue/avatar-label';
import { provideThemeOptions } from '@cocokits/vue-core';
import { avatarLabelThemeKey } from './theme-keys';
import type { AvatarLabelProps } from './avatar-label.types';

defineOptions({ name: 'AvatarLabel' });

const props = withDefaults(defineProps<AvatarLabelProps>(), {
  name: undefined,
  description: undefined,
  as: undefined,
  asChild: undefined,
  size: undefined,
  avatarPosition: undefined,
  labelAlignment: undefined,
});

defineSlots<{
  /** The avatar, a direct child written first. The text follows it. */
  default?(): unknown;
}>();

const base = useTemplateRef<{ readonly element: Element | null }>('base');

defineExpose({
  /**
   * The DOM element of the AvatarLabel: the `<div>`, or the element of the `as` component or `asChild` child.
   * `null` before mount.
   *
   * @cckSemantic none
   * @remarks Templates reach the DOM node through the component ref.
   */
  get element(): Element | null {
    return base.value?.element ?? null;
  },
});

provide(avatarLabelThemeKey, () => ({ size: props.size }));
provideThemeOptions('avatar-label', () => ({
  size: props.size,
  avatarPosition: props.avatarPosition,
  labelAlignment: props.labelAlignment,
}));
</script>

<template>
  <BaseAvatarLabel ref="base" :name="name" :description="description" :as="as" :as-child="asChild"
    ><slot
  /></BaseAvatarLabel>
</template>
