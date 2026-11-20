import { Location } from '@angular/common';
import type { Injector } from '@angular/core';

/**
 * Calls `onNavigate` when the location changes, for the `closeOnNavigation` of a dialog.
 *
 * @param injector - Gives the `Location`. It is asked for here, in the browser only: `Location` reads the DOM when it is created.
 * @param mode - `true` and `'pop-state'` watch the history and the hash, `'url-change'` watches every URL change, anything else watches nothing.
 * @param onNavigate - Called on each change.
 * @returns The function that stops watching.
 * @internal
 */
export function watchNavigation(
  injector: Injector,
  mode: boolean | 'pop-state' | 'url-change' | undefined,
  onNavigate: () => void,
): () => void {
  if (mode !== true && mode !== 'pop-state' && mode !== 'url-change') return () => undefined;
  const location = injector.get(Location);
  if (mode === 'url-change') return location.onUrlChange(onNavigate);
  const subscription = location.subscribe(onNavigate);
  return () => {
    subscription.unsubscribe();
  };
}
