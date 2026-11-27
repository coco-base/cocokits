<script setup lang="ts">
import { computed, mergeProps, provide, shallowRef, useAttrs, useTemplateRef, type ComponentPublicInstance } from 'vue';
import { avatarAnatomy, getAvatarProps, type AvatarImageLoadingStatus } from '@cocokits/machines/avatar';
import { isDevelopment, Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { rootElementOf } from '../internal/root-element';
import { AVATAR_KEY } from './avatar.context';
import type { AvatarRootProps } from './avatar.types';

defineOptions({ name: 'CckAvatarRoot', inheritAttrs: false });

withDefaults(defineProps<AvatarRootProps>(), { as: 'span', asChild: false });
defineSlots<{
  /**
   * The `AvatarImage` and the `AvatarFallback`. When not set, the avatar is empty.
   *
   * @example
   * <AvatarRoot>
   *   <AvatarImage src="/ada.webp" alt="Ada Lovelace" />
   *   <AvatarFallback>AL</AvatarFallback>
   * </AvatarRoot>
   */
  default?(): unknown;
}>();

const attrs = useAttrs();
const themeAttrs = useThemeAttrs(avatarAnatomy);
const status = shallowRef<AvatarImageLoadingStatus>('idle');
let images = 0;

// Development only: the second image logs one warning. Production skips the count.
function registerImage(): () => void {
  if (!isDevelopment()) return () => undefined;
  images += 1;
  if (images === 2) console.warn('CocoKits: an <AvatarRoot> must have one <AvatarImage>; it has more than one.');
  return () => {
    images -= 1;
  };
}

provide(AVATAR_KEY, {
  status,
  setStatus: (next) => {
    status.value = next;
  },
  registerImage,
});

const bound = computed(() => mergeProps(themeAttrs.value.root, attrs, { ...getAvatarProps({ status: 'idle' }).root }));
const root = useTemplateRef<ComponentPublicInstance>('root');

defineExpose({
  /**
   * The DOM element of the Avatar: the `<span>`, or the element of the `as` component or the `asChild` child. It is
   * `null` before mount.
   *
   * @example
   * <AvatarRoot ref="avatar">...</AvatarRoot>
   * <!-- In the script: const avatar = useTemplateRef('avatar'); then avatar.value?.element is the element. -->
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
  <Primitive ref="root" v-bind="bound" :as="as" :as-child="asChild"><slot /></Primitive>
</template>
