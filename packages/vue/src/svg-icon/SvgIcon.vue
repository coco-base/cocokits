<script setup lang="ts">
import { computed, onMounted, shallowRef, useTemplateRef, watch } from 'vue';
import { parseSvg } from '@cocokits/cdk/icon-registry';
import type { Icon } from '@cocokits/icons';
import { getSvgIconProps, svgIconAnatomy } from '@cocokits/machines/svg-icon';
import { isDevelopment, useIconRegistry, useThemeAttrs } from '@cocokits/vue-core';
import { useIconVersion } from '../internal/use-icon-version';
import type { SvgIconProps } from './svg-icon.types';

defineOptions({ name: 'CckSvgIcon' });

const props = defineProps<SvgIconProps>();

const themeAttrs = useThemeAttrs(svgIconAnatomy);
const registry = useIconRegistry();
const { track, bump } = useIconVersion(registry);
/** The icon parsed from `svg`, set after mount. */
const parsed = shallowRef<Icon | undefined>();
const name = computed(() => (props.iconName === undefined || props.iconName === '' ? undefined : props.iconName));
const icon = computed(() => {
  track();
  return name.value === undefined ? parsed.value : registry.get(name.value);
});
const parts = computed(() => getSvgIconProps({ iconName: name.value, icon: icon.value, label: props.label }));
const rootAttrs = computed(() => ({ ...themeAttrs.value.root, ...parts.value.root }));

function report(message: string): void {
  if (isDevelopment()) console.error(`CocoKits: ${message}`);
}

/** Starts the load of a lazy icon that is registered but not loaded yet. */
function loadIfNeeded(): void {
  const wanted = name.value;
  if (wanted === undefined || registry.get(wanted) !== undefined || !registry.has(wanted)) return;
  void registry.load(wanted).then((found) => {
    if (found !== undefined) bump();
  });
}

/** After mount, so the server render and the first client render are the same. */
function sync(): void {
  const wanted = name.value;
  const svg = props.svg ?? '';
  const given = svg !== '';
  if (wanted !== undefined && given) {
    report('SvgIcon got both iconName and svg; iconName is used. Give one of them.');
  }
  if (wanted === undefined && !given) {
    report('SvgIcon needs an iconName or an svg, and got neither, so it draws nothing.');
  }
  if (wanted !== undefined) {
    parsed.value = undefined;
    if (!registry.has(wanted)) {
      report(`no icon named "${wanted}" is registered; register it with registerIcons or registerIcon.`);
    }
    loadIfNeeded();
    return;
  }
  parsed.value = given ? parseSvg(svg) : undefined;
  if (given && parsed.value === undefined) report('the svg is not an <svg> element with a viewBox or a size.');
}
onMounted(sync);
watch([name, () => props.svg], sync, { flush: 'post' });
// A name that is registered, or a lazy icon that arrives later, is drawn then.
watch(track, loadIfNeeded, { flush: 'post' });

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
    <svg
      :class="parts.svg.class"
      :viewBox="parts.svg.viewBox"
      :aria-hidden="parts.svg['aria-hidden']"
      :focusable="parts.svg.focusable"
      v-html="parts.body"
    />
  </span>
</template>
