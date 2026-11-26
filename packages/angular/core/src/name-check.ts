import { afterEveryRender } from '@angular/core';

/**
 * Development only: runs `check` once, after the first render at which `element()` is in the document. A control
 * projected into content that is not shown yet (a closed accordion item, an unselected tab) is created detached, so
 * its accessible name cannot be read until the content is shown; checking it then would warn about a name it has.
 * Call it in an injection context (a constructor). Nothing runs on the server or in production; the wait ends when
 * the directive is destroyed.
 *
 * @param element - The element whose name is checked, such as the native input.
 * @param check - The name check, called with the element; it warns when nothing names it.
 * @internal
 */
export function checkNameWhenAttached<T extends Element>(
  element: () => T | null | undefined,
  check: (element: T) => void,
): void {
  if (typeof ngDevMode !== 'undefined' && !ngDevMode) return;
  const ref = afterEveryRender(() => {
    const current = element();
    if (!current?.isConnected) return;
    ref.destroy();
    check(current);
  });
}
