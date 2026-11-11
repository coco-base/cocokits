import { onBeforeUnmount, onMounted, type Ref } from 'vue';
import { hasAccessibleName } from '@cocokits/utils';
import { isDevelopment } from '@cocokits/vue-core';

/**
 * Development only: one frame after mount, warns when nothing names the native input of a Checkbox, a Switch or a
 * Radio. The frame lets a `<label for>` outside and the group commit first. Call it in `setup`.
 *
 * @param componentName - The name of the component, for the text.
 * @param inputRef - The template ref of the native input.
 */
export function useUnnamedWarning(componentName: string, inputRef: Readonly<Ref<HTMLInputElement | null>>): void {
  onMounted(() => {
    if (!isDevelopment() || typeof requestAnimationFrame !== 'function') return;
    const frame = requestAnimationFrame(() => {
      const input = inputRef.value;
      if (!input || hasAccessibleName(input)) return;
      console.warn(
        `CocoKits: a ${componentName} has no accessible name. Put the caption text inside it, or add an aria-label, a title, an aria-labelledby that points to an element with text, or a <label for> with text that points at its id.`,
      );
    });
    onBeforeUnmount(() => {
      cancelAnimationFrame(frame);
    });
  });
}
