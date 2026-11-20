<script setup lang="ts">
import { computed, h, useTemplateRef, type ComponentPublicInstance, type VNode } from 'vue';
import { avatarLabelAnatomy, getAvatarLabelProps } from '@cocokits/machines/avatar-label';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { rootElementOf } from '../internal/root-element';
import type { AvatarLabelProps } from './avatar-label.types';

defineOptions({ name: 'CckAvatarLabel' });

const props = withDefaults(defineProps<AvatarLabelProps>(), {
  name: undefined,
  description: undefined,
  as: 'div',
  asChild: false,
});
defineSlots<{
  /**
   * The avatar, a direct child written first. The text follows it. When not set, the label shows only the text.
   *
   * @remarks With `asChild`, the slot holds the one element the label merges onto.
   *
   * @example
   * <AvatarLabel name="Ada Lovelace">
   *   <AvatarRoot aria-hidden="true"><AvatarFallback>AL</AvatarFallback></AvatarRoot>
   * </AvatarLabel>
   */
  default?(): unknown;
}>();

const themeAttrs = useThemeAttrs(avatarLabelAnatomy);
const parts = computed(() => getAvatarLabelProps({ name: props.name, description: props.description }));

/** The text block, after the avatar. */
function textNodes(): VNode[] {
  const { text, name, description } = parts.value;
  if (!text) return [];
  return [
    h('span', { ...themeAttrs.value.text, class: text.class }, [
      ...(name ? [h('span', { ...themeAttrs.value.name, class: name.class }, props.name ?? '')] : []),
      ...(description
        ? [h('span', { ...themeAttrs.value.description, class: description.class }, props.description ?? '')]
        : []),
    ]),
  ];
}

// With `asChild` the label puts the avatar and the text inside the child.
const inChild = (hostChildren?: VNode[]): VNode[] => [...(hostChildren ?? []), ...textNodes()];

const root = useTemplateRef<ComponentPublicInstance>('root');

defineExpose({
  /**
   * The DOM element of the AvatarLabel: the `<div>`, or the element of the `as` component or the `asChild` child. It
   * is `null` before mount.
   *
   * @example
   * <AvatarLabel ref="label" name="Ada Lovelace" />
   * <!-- In the script: const label = useTemplateRef('label'); then label.value?.element is the element. -->
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
    :as="as"
    :as-child="asChild"
    :as-child-content="inChild"
    v-bind="{ ...themeAttrs.root, ...parts.root }"
  >
    <slot />
    <span v-if="parts.text && !asChild && as !== 'template'" v-bind="themeAttrs.text" :class="parts.text.class">
      <span v-if="parts.name" v-bind="themeAttrs.name" :class="parts.name.class">{{ name }}</span>
      <span v-if="parts.description" v-bind="themeAttrs.description" :class="parts.description.class">{{
        description
      }}</span>
    </span>
  </Primitive>
</template>
