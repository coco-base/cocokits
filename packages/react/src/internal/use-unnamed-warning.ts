'use client';

import { useEffect, type RefObject } from 'react';
import { hasAccessibleName } from '@cocokits/utils';
import { isDevelopment } from './dev';

/** What the message of {@link useUnnamedWarning} says besides the name of the component. */
export interface UnnamedWarningOptions {
  /** The console method: `warn` for a control that a label outside can name, `error` for an icon-only one. */
  readonly level?: 'warn' | 'error';
  /** The sentence that tells how to name the element. */
  readonly fix?: string;
  /** A value that changes when the sources of the name change; the check runs again then. */
  readonly key?: string;
}

const CAPTION_FIX =
  'Put the caption text inside it, or add an aria-label, a title, an aria-labelledby that points to an element with text, or a <label for> with text that points at its id.';

/**
 * Development only: warns after mount when nothing names the element of a Checkbox, a Switch, a Radio or an
 * IconButton. It waits a frame so that the field's Label has committed its `for`.
 *
 * @param componentName - The name of the component, for the text.
 * @param elementRef - The ref of the element that needs a name.
 * @param options - The console method, the fix sentence and the re-check key; a warning with the caption text by default.
 */
export function useUnnamedWarning(
  componentName: string,
  elementRef: RefObject<Element | null>,
  { level = 'warn', fix = CAPTION_FIX, key = '' }: UnnamedWarningOptions = {},
): void {
  useEffect(() => {
    if (!isDevelopment()) return undefined;
    const frame = requestAnimationFrame(() => {
      const element = elementRef.current;
      if (element && !hasAccessibleName(element)) {
        console[level](
          `CocoKits: ${/^[AEIOU]/.test(componentName) ? 'an' : 'a'} ${componentName} has no accessible name. ${fix}`,
        );
      }
    });
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [componentName, elementRef, level, fix, key]);
}
