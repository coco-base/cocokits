<script setup lang="ts">
import { computed, mergeProps, onBeforeUnmount, onMounted, useAttrs, useTemplateRef, watch } from 'vue';
import {
  avatarAnatomy,
  getAvatarProps,
  watchImageLoadingStatus,
  type AvatarImageLoadingStatus,
} from '@cocokits/machines/avatar';
import { useThemeAttrs } from '@cocokits/vue-core';
import { useAvatarContext } from './avatar.context';
import type { AvatarImageEmits, AvatarImageProps } from './avatar.types';

defineOptions({ name: 'CckAvatarImage', inheritAttrs: false });

const props = withDefaults(defineProps<AvatarImageProps>(), {
  src: undefined,
  crossOrigin: undefined,
  referrerPolicy: undefined,
});
const emit = defineEmits<AvatarImageEmits>();

const ctx = useAvatarContext('AvatarImage');
const themeAttrs = useThemeAttrs(avatarAnatomy);
const attrs = useAttrs();
const parts = computed(() => getAvatarProps({ status: ctx.status.value }));
const bound = computed(() =>
  mergeProps(themeAttrs.value.image, attrs, {
    ...parts.value.image,
    src: props.src,
    crossorigin: props.crossOrigin,
    referrerpolicy: props.referrerPolicy,
  }),
);

let mounted = false;
let lastReported: AvatarImageLoadingStatus | undefined;
let stop = (): void => undefined;
let unregister = (): void => undefined;

function report(status: AvatarImageLoadingStatus): void {
  ctx.setStatus(status);
  if (status === lastReported) return;
  lastReported = status;
  emit('loadingStatusChange', status);
}

// A new source replaces the status directly: the next probe's first status, never `idle` in between.
function probe(): void {
  stop();
  stop = watchImageLoadingStatus(
    { src: props.src, crossOrigin: props.crossOrigin, referrerPolicy: props.referrerPolicy },
    report,
  );
}

onMounted(() => {
  mounted = true;
  unregister = ctx.registerImage();
  probe();
});
watch(
  () => [props.src, props.crossOrigin, props.referrerPolicy],
  () => {
    if (mounted) probe();
  },
);
onBeforeUnmount(() => {
  mounted = false;
  stop();
  unregister();
  ctx.setStatus('idle');
});

const image = useTemplateRef<HTMLImageElement>('image');

defineExpose({
  /**
   * The DOM element of the image: the `<img>`. It is `null` before mount.
   *
   * @example
   * <AvatarImage ref="picture" src="/ada.webp" alt="Ada Lovelace" />
   * <!-- In the script: const picture = useTemplateRef('picture'); then picture.value?.element is the img. -->
   *
   * @cckSemantic none
   * @cckParity Templates reach the DOM node through the component ref.
   */
  get element(): HTMLImageElement | null {
    return image.value;
  },
});
</script>

<template>
  <img ref="image" v-bind="bound" />
</template>
