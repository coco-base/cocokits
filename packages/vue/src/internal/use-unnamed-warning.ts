import { onBeforeUnmount, onMounted, type Ref } from 'vue';
import { hasAccessibleName } from '@cocokits/utils';
import { isDevelopment } from '@cocokits/vue-core';

/** What the message of {@link useUnnamedWarning} says besides the name of the component. */
export interface UnnamedWarningOptions {
  /** The console method: `warn` for a control that a label outside can name, `error` for an icon-only one. */
  readonly level?: 'warn' | 'error';
  /** The sentence that tells how to name the element. */
  readonly fix?: string;
}

const CAPTION_FIX =
  'Put the caption text inside it, or add an aria-label, a title, an aria-labelledby that points to an element with text, or a <label for> with text that points at its id.';

/**
 * Development only: one frame after mount, reports when nothing names the element of a Checkbox, a Switch, a Radio
 * or an IconButton. The frame lets a `<label for>` outside and the group commit first. Call it in `setup`.
 *
 * @param componentName - The name of the component, for the text.
 * @param elementRef - The template ref of the element that needs a name (any object with a `value` works).
 * @param options - The console method and the fix sentence; a warning with the caption text by default.
 */
export function useUnnamedWarning(
  componentName: string,
  elementRef: Readonly<Pick<Ref<Element | null>, 'value'>>,
  { level = 'warn', fix = CAPTION_FIX }: UnnamedWarningOptions = {},
): void {
  onMounted(() => {
    if (!isDevelopment() || typeof requestAnimationFrame !== 'function') return;
    const frame = requestAnimationFrame(() => {
      const element = elementRef.value;
      if (!element || hasAccessibleName(element)) return;
      console[level](
        `CocoKits: ${/^[AEIOU]/.test(componentName) ? 'an' : 'a'} ${componentName} has no accessible name. ${fix}`,
      );
    });
    onBeforeUnmount(() => {
      cancelAnimationFrame(frame);
    });
  });
}
