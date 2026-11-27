<script setup lang="ts">
import {
  computed,
  mergeProps,
  onBeforeUnmount,
  onMounted,
  shallowRef,
  useAttrs,
  useTemplateRef,
  watch,
  type ComponentPublicInstance,
} from 'vue';
import { avatarAnatomy, getAvatarProps } from '@cocokits/machines/avatar';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { rootElementOf } from '../internal/root-element';
import { useAvatarContext } from './avatar.context';
import type { AvatarFallbackProps } from './avatar.types';

defineOptions({ name: 'CckAvatarFallback', inheritAttrs: false });

const props = withDefaults(defineProps<AvatarFallbackProps>(), { delayMs: undefined, as: 'span', asChild: false });
defineSlots<{
  /**
   * The content shown while the picture is not loaded: initials, an icon or any content. When not set, the fallback
   * is empty.
   *
   * @example
   * <AvatarFallback>AL</AvatarFallback>
   */
  default?(): unknown;
}>();

const ctx = useAvatarContext('AvatarFallback');
const themeAttrs = useThemeAttrs(avatarAnatomy);
const attrs = useAttrs();
// With a delay the fallback starts hidden, on the server too; the timer starts after mount.
const delayPassed = shallowRef(props.delayMs === undefined);
const parts = computed(() => getAvatarProps({ status: ctx.status.value, delayPassed: delayPassed.value }));
const bound = computed(() => mergeProps(themeAttrs.value.fallback, attrs, { ...parts.value.fallback }));

let mounted = false;
let timer: ReturnType<typeof setTimeout> | undefined;

function wait(): void {
  clearTimeout(timer);
  timer = undefined;
  if (props.delayMs === undefined) {
    delayPassed.value = true;
    return;
  }
  delayPassed.value = false;
  timer = setTimeout(() => {
    delayPassed.value = true;
  }, props.delayMs);
}

onMounted(() => {
  mounted = true;
  wait();
});
watch(
  () => props.delayMs,
  () => {
    if (mounted) wait();
  },
);
onBeforeUnmount(() => {
  mounted = false;
  clearTimeout(timer);
});

const root = useTemplateRef<ComponentPublicInstance>('root');

defineExpose({
  /**
   * The DOM element of the fallback: the `<span>`, or the element of the `as` component or the `asChild` child. It
   * is `null` before mount.
   *
   * @example
   * <AvatarFallback ref="fallback">AL</AvatarFallback>
   * <!-- In the script: const fallback = useTemplateRef('fallback'); then fallback.value?.element is the element. -->
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
  <Primitive ref="root" v-bind="bound" :as="as" :as-child="asChild" :priority-attrs="['hidden']"><slot /></Primitive>
</template>
