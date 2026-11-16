<script setup lang="ts">
import { inject, useTemplateRef } from 'vue';
import { AvatarRoot as BaseAvatarRoot } from '@cocokits/vue/avatar';
import { provideThemeOptions } from '@cocokits/vue-core';
import { resolveInheritedValue } from '@cocokits/theme-cocokits';
import { avatarGroupThemeKey, avatarLabelThemeKey } from './theme-keys';
import type { AvatarRootProps } from './avatar.types';

defineOptions({ name: 'AvatarRoot' });

const props = withDefaults(defineProps<AvatarRootProps>(), {
  as: undefined,
  asChild: undefined,
  size: undefined,
  color: undefined,
});

defineSlots<{
  /** The `AvatarImage` and the `AvatarFallback`, or any content. */
  default?(): unknown;
}>();

const base = useTemplateRef<{ readonly element: Element | null }>('base');

defineExpose({
  /**
   * The DOM element of the Avatar: the `<span>`, or the element of the `as` component or `asChild` child.
   * `null` before mount.
   *
   * @cckSemantic none
   * @remarks Templates reach the DOM node through the component ref.
   */
  get element(): Element | null {
    return base.value?.element ?? null;
  },
});

const label = inject(avatarLabelThemeKey, null);
const group = inject(avatarGroupThemeKey, null);
provideThemeOptions('avatar', () => ({
  size: resolveInheritedValue(props.size, label?.().size, group?.().size),
  color: props.color,
}));
</script>

<template>
  <BaseAvatarRoot ref="base" :as="as" :as-child="asChild"><slot /></BaseAvatarRoot>
</template>
