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
   * The element the Badge merges onto, with `asChild` or `as="template"`. The Badge puts its own content parts
   * inside it. When not set, or when the Badge does not merge, nothing from the slot renders.
   *
   * @example
   * <Badge as-child :content="5"><strong /></Badge>
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
   * The DOM element of the Badge: the `<span>`, or the element of the `as` component or the `asChild` child. It is
   * `null` before mount.
   *
   * @example
   * <Badge ref="badge" :content="5" />
   * <!-- In the script: const badge = useTemplateRef('badge'); then badge.value?.element is the element. -->
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
