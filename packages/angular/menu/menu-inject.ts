import { inject } from '@angular/core';
import { CckMenuBase } from './menu-base';

/**
 * Finds the nearest menu or submenu above a part.
 *
 * @param part - The part's name, for the error message.
 * @returns The menu.
 * @internal
 */
export function injectCckMenu(part: string): CckMenuBase {
  const root = inject(CckMenuBase, { optional: true });
  if (!root) throw new Error(`CocoKits: cckMenu${part} must be placed inside an element with cckMenu.`);
  return root;
}
