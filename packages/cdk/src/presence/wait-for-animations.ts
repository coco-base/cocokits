/**
 * Whether a wait covers an animation: a CSS animation (a CSS animation carries an animation name; a
 * transition or a script animation does not, and this needs no `CSSAnimation` global) that is running
 * and ends in finite time.
 */
function isAwaited(animation: Animation): boolean {
  if (!('animationName' in animation) || animation.playState !== 'running') return false;
  return Number.isFinite(animation.effect?.getComputedTiming().endTime);
}

/**
 * The CSS animations on the element that a wait covers, read now. Empty when the element has none or
 * the platform has no `getAnimations`.
 *
 * @param element - The element to read; `null` when it is not rendered.
 * @returns The running, finite CSS animations.
 */
export function awaitedAnimations(element: HTMLElement | null): Animation[] {
  if (!element || typeof element.getAnimations !== 'function') return [];
  return element.getAnimations().filter(isAwaited);
}

/**
 * Resolves once every given animation has finished or been canceled.
 *
 * @param animations - The animations from {@link awaitedAnimations}.
 * @returns A promise that never rejects; it settles in a microtask when the list is empty.
 */
export async function settleAnimations(animations: readonly Animation[]): Promise<void> {
  await Promise.allSettled(animations.map((animation) => animation.finished));
}

/**
 * Waits for the element's CSS animations, for the exit: resolves when every CSS animation on the element that is
 * running and finite, read at the call, has finished or been canceled, and in the next microtask when there is
 * none. CSS transitions, paused or infinite animations and `element.animate()` animations are not
 * awaited. It never times out. Call it after the state that starts the animation is rendered, so the
 * animation already exists when it is read.
 *
 * @param element - The element to wait for; `null` when it is not rendered.
 * @returns A promise that resolves when the animations are done; it never rejects.
 *
 * @example
 * ```ts
 * dialog.showModal();
 * await waitForAnimations(dialog);
 * // the enter animation has ended
 * ```
 */
export function waitForAnimations(element: HTMLElement | null): Promise<void> {
  return settleAnimations(awaitedAnimations(element));
}
