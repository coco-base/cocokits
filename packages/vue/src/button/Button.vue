<script setup lang="ts">
import { computed, useAttrs, onMounted, useTemplateRef, watch, type ComponentPublicInstance } from 'vue';
import { buttonAnatomy, getButtonProps } from '@cocokits/machines/button';
import { isDevelopment, Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { rootElementOf } from '../internal/root-element';
import type { ButtonProps } from './button.types';

defineOptions({ name: 'CckButton', inheritAttrs: false });

const props = withDefaults(defineProps<ButtonProps>(), { disabled: undefined, as: 'button', asChild: false });

defineSlots<{
  /** The content of the Button: text and icons. An icon-only Button needs `aria-label` or `aria-labelledby`. */
  default?(): unknown;
}>();

const themeAttrs = useThemeAttrs(buttonAnatomy);
// Only the native `button` is a button. Any other tag or component, and `asChild`, is a link.
const isLink = computed(() => props.asChild || props.as !== 'button');
const machine = computed(() => {
  const {
    class: className,
    onClick,
    ...markers
  } = getButtonProps({
    element: isLink.value ? 'a' : 'button',
    disabled: !!props.disabled,
  });
  return { className, onClick, state: markers, markers: { ...themeAttrs.value.root, ...markers } };
});

// The machine's state markers (not the theme attrs) win over an `asChild` child's own props: while disabled,
// its markers; while enabled, none. The data attrs the machine sets on a disabled button or link are reserved: only the machine sets
// them, so neither a consumer attr nor a child can.
const reserved = [
  ...new Set(
    (['a', 'button'] as const).flatMap((element) =>
      Object.keys(getButtonProps({ element, disabled: true })).filter((name) => name.startsWith('data-')),
    ),
  ),
];
const attrs = useAttrs();
// A consumer `type` wins; a link has none.
const type = computed(() => (attrs as { type?: unknown }).type ?? (isLink.value ? undefined : 'button'));
function boundAttrs(): Record<string, unknown> {
  return { ...attrs, ...Object.fromEntries(reserved.map((name) => [name, undefined])), ...machine.value.markers };
}
const priorityAttrs = computed(() => [...Object.keys(machine.value.state), ...reserved]);

// Bound with `@click.capture` after the attrs, so a consumer `@click.capture` runs first and may veto.
function guard(event: MouseEvent): void {
  machine.value.onClick?.(event);
}

const root = useTemplateRef<ComponentPublicInstance>('root');

function rootElement(): Element | null {
  return rootElementOf(root.value);
}

defineExpose({
  /**
   * The DOM element of the Button: the `<button>`, the `<a>` or the element of the `as` component.
   * `null` before mount.
   *
   * @cckSemantic none
   * @cckParity Templates reach the DOM node through the component ref.
   */
  get element(): Element | null {
    return rootElement();
  },
});

/** Logs a `CocoKits:` error when the rendered tag does not match the element kind. */
function checkElementKind(): void {
  const element = rootElement();
  if (!isDevelopment() || !element) return;
  const tag = element.tagName.toLowerCase();
  if (!isLink.value && tag !== 'button') {
    console.error(`CocoKits: <Button> renders a native <button>, but its element is <${tag}>.`);
  } else if (isLink.value && tag === 'button') {
    console.error(
      'CocoKits: <Button> renders a link (as is not "button", or asChild is set), but its element is a <button>. Use as="button", or render an <a>.',
    );
  } else if (isLink.value && tag !== 'a') {
    console.error(
      `CocoKits: <Button> renders a link, which must be an <a> (or a component that renders one), but its element is <${tag}>.`,
    );
  }
}

onMounted(checkElementKind);
watch(isLink, checkElementKind, { flush: 'post' });
</script>

<template>
  <Primitive
    ref="root"
    v-bind="boundAttrs()"
    :as="as"
    :as-child="asChild"
    :priority-attrs="priorityAttrs"
    :class="machine.className"
    :type="type"
    @click.capture="guard"
  >
    <slot />
  </Primitive>
</template>
