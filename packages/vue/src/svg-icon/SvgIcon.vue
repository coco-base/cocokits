<script setup lang="ts">
import { computed, onMounted, useTemplateRef, watch } from 'vue';
import { getSvgIconProps, svgIconAnatomy } from '@cocokits/machines/svg-icon';
import { isDevelopment, useThemeAttrs, useThemeIcons } from '@cocokits/vue-core';
import type { SvgIconProps } from './svg-icon.types';

defineOptions({ name: 'CckSvgIcon' });

const props = defineProps<SvgIconProps>();

const themeAttrs = useThemeAttrs(svgIconAnatomy);
const icons = useThemeIcons();
const parts = computed(() =>
  getSvgIconProps({ iconName: props.iconName, icons: icons.value.icons, label: props.label }),
);
const found = computed(() => parts.value.svg.viewBox !== undefined);
const rootAttrs = computed(() => ({ ...themeAttrs.value.root, ...parts.value.root }));

/** Development only: the name is not in the theme. After mount, so the server render has no effect. */
function reportMissing(): void {
  if (!found.value && isDevelopment()) {
    console.error(
      `CocoKits: the theme has no icon named "${props.iconName}". Check the name, or add the icon to the icons of the theme config.`,
    );
  }
}
onMounted(reportMissing);
watch(() => [props.iconName, found.value], reportMissing, { flush: 'post' });

// The template writes only `svg` and `path` elements with bound attributes: no icon data is parsed or injected as
// markup.
const root = useTemplateRef<HTMLElement>('root');

defineExpose({
  /**
   * The DOM element of the root: the `<span>`. It is `null` before mount.
   *
   * @example
   * <SvgIcon ref="icon" icon-name="heart" />
   * <!-- In the script: const icon = useTemplateRef('icon'); then icon.value?.element is the span. -->
   *
   * @cckSemantic none
   * @cckParity Templates reach the DOM node through the component ref.
   */
  get element(): HTMLElement | null {
    return root.value;
  },
});
</script>

<template>
  <span ref="root" v-bind="rootAttrs">
    <svg :class="parts.svg.class" :viewBox="parts.svg.viewBox">
      <path
        v-for="(path, index) in parts.paths"
        :key="index"
        :d="path.d"
        :fill-rule="path['fill-rule']"
        :clip-rule="path['clip-rule']"
      />
    </svg>
  </span>
</template>
