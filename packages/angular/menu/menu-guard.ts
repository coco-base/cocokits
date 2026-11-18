import type { Renderer2 } from '@angular/core';
import { visuallyHiddenStyle } from '@cocokits/utils';

/**
 * Makes a focusable, empty, invisible `span` that catches Tab at an end of the menu content.
 *
 * @param renderer - Creates the element.
 * @returns The guard, not yet in the document.
 * @internal
 */
export function createMenuGuard(renderer: Renderer2): HTMLElement {
  const guard = renderer.createElement('span') as HTMLElement;
  renderer.setAttribute(guard, 'tabindex', '0');
  for (const [name, value] of Object.entries(visuallyHiddenStyle)) renderer.setStyle(guard, name, value);
  return guard;
}
