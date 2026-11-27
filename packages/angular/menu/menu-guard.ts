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

/**
 * Puts a guard before and after the content, in the element around it.
 *
 * @param renderer - Creates and moves the guards.
 * @param content - The content element.
 * @returns The guards, and the function that removes them.
 * @internal
 */
export function insertMenuGuards(
  renderer: Renderer2,
  content: HTMLElement,
): { readonly guards: readonly [HTMLElement, HTMLElement]; readonly remove: () => void } {
  const guards = [createMenuGuard(renderer), createMenuGuard(renderer)] as const;
  const host = content.parentElement;
  if (host) {
    renderer.insertBefore(host, guards[0], content);
    renderer.appendChild(host, guards[1]);
  }
  return {
    guards,
    remove: () => {
      for (const guard of guards) renderer.removeChild(guard.parentNode, guard);
    },
  };
}
