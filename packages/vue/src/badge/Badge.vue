<script setup lang="ts">
import { computed, h, mergeProps, useAttrs, useTemplateRef, type ComponentPublicInstance, type VNode } from 'vue';
import { badgeAnatomy, getBadgeProps } from '@cocokits/machines/badge';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { rootElementOf } from '../internal/root-element';
import type { BadgeProps } from './badge.types';

defineOptions({ name: 'CckBadge', inheritAttrs: false });

const props = withDefaults(defineProps<BadgeProps>(), {
  content: undefined,
  max: undefined,
  hide: false,
  as: 'span',
  asChild: false,
});

defineSlots<{
  /**
   * The element the Badge merges onto when it merges (`asChild`, or `as="template"`); the Badge puts its own content parts inside it. Not rendered otherwise.
   *
   * @cckSemantic none
   * @cckParity Used with `asChild` only: the element the Badge merges onto.
   */
  default?(): unknown;
}>();

const attrs = useAttrs();
const themeAttrs = useThemeAttrs(badgeAnatomy);
const parts = computed(() => getBadgeProps({ content: props.content, max: props.max, hide: props.hide }));

/** Whether the Badge merges onto its slot child: `asChild`, or `as="template"`, which means the same. */
const merges = computed(() => props.asChild || props.as === 'template');

// `hidden` is the base's promise: neither a consumer attr nor an `asChild` child can turn it off.
const hidden = computed(() => (parts.value.root.hidden ? { hidden: true } : {}));
const boundAttrs = computed(() => mergeProps({ ...themeAttrs.value.root, ...parts.value.root }, attrs, hidden.value));

/** The content and max indicator parts; none while hidden. */
function partNodes(): VNode[] {
  const { content: shown, maxIndicator } = parts.value;
  return [
    ...(shown ? [h('span', { ...themeAttrs.value.content, class: shown.class }, shown.text)] : []),
    ...(maxIndicator
      ? [h('span', { ...themeAttrs.value.maxIndicator, class: maxIndicator.class }, maxIndicator.text)]
      : []),
  ];
}

const root = useTemplateRef<ComponentPublicInstance>('root');

defineExpose({
  /**
   * The DOM element of the Badge: the `<span>`, or the element of the `as` component or `asChild` child.
   * `null` before mount.
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
  <Primitive
    ref="root"
    v-bind="boundAttrs"
    :as="as"
    :as-child="merges"
    :priority-attrs="parts.root.hidden ? ['hidden'] : []"
    :as-child-content="partNodes"
  >
    <slot v-if="merges" />
    <template v-else>
      <span v-if="parts.content" v-bind="themeAttrs.content" :class="parts.content.class">{{
        parts.content.text
      }}</span>
      <span v-if="parts.maxIndicator" v-bind="themeAttrs.maxIndicator" :class="parts.maxIndicator.class">{{
        parts.maxIndicator.text
      }}</span>
    </template>
  </Primitive>
</template>
