<script setup lang="ts">
import { inject } from 'vue';
import {
  DialogContent as BaseDialogContent,
  type DialogContentEmits,
  type DialogContentProps,
} from '@cocokits/vue/dialog';
import { provideThemeOptions } from '@cocokits/vue-core';
import { dialogThemeKey } from './theme-keys';

defineOptions({ name: 'DialogContent' });

// `undefined` lets the base decide each default.
withDefaults(defineProps<DialogContentProps>(), { forceMount: undefined });
const emit = defineEmits<DialogContentEmits>();

defineSlots<{
  /** The title, the description, the body and the close buttons. */
  default?(): unknown;
}>();

// The size of the `DialogRoot` around it; the content draws it, whatever theme wrapper sits between them.
const root = inject(dialogThemeKey, null);
provideThemeOptions('dialog', () => ({ size: root?.().size }));
</script>

<template>
  <BaseDialogContent
    :force-mount="forceMount"
    @escape-key-down="emit('escapeKeyDown', $event)"
    @pointer-down-outside="emit('pointerDownOutside', $event)"
  >
    <slot />
  </BaseDialogContent>
</template>
