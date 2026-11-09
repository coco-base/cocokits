/**
 * Whether a wait covers an animation: a running CSS animation that ends in finite time.
 * A CSS animation has an animation name. A transition and a script animation do not, and the check needs no `CSSAnimation` global.
 */
function isAwaited(animation: Animation): boolean {
  if (!('animationName' in animation) || animation.playState !== 'running') return false;
  return Number.isFinite(animation.effect?.getComputedTiming().endTime);
}

/**
 * The CSS animations on the element that a wait covers, read now.
 * The list is empty when the element has none or the platform has no `getAnimations`.
 *
 * @param element - The element to read, or `null` when it is not rendered.
 * @returns The running, finite CSS animations.
 * @example
 * const panel = document.querySelector<HTMLElement>('#panel')!;
 * const count = awaitedAnimations(panel).length;
 */
export function awaitedAnimations(element: HTMLElement | null): Animation[] {
  if (!element || typeof element.getAnimations !== 'function') return [];
  return element.getAnimations().filter(isAwaited);
}

/**
 * Resolves once every given animation has finished or been canceled.
 *
 * @param animations - The animations from {@link awaitedAnimations}.
 * @returns A promise that never rejects. It settles in a microtask when the list is empty.
 * @example
 * const panel = document.querySelector<HTMLElement>('#panel')!;
 * await settleAnimations(awaitedAnimations(panel));
 */
export async function settleAnimations(animations: readonly Animation[]): Promise<void> {
  await Promise.allSettled(animations.map((animation) => animation.finished));
}

/**
 * Waits for the CSS animations of an element, for example before you remove it after an exit animation.
 * The promise resolves when every running, finite CSS animation has finished or been canceled.
 * When there is none, it resolves in the next microtask.
 *
 * @remarks
 * CSS transitions, paused animations, infinite animations and `element.animate()` animations are not awaited.
 * It never times out. Call it after the state that starts the animation is rendered, so the animation
 * already exists when it is read.
 *
 * @param element - The element to wait for, or `null` when it is not rendered.
 * @returns A promise that resolves when the animations are done. It never rejects.
 * @example
 * const dialog = document.querySelector<HTMLDialogElement>('dialog')!;
 * dialog.classList.add('closing');
 * await waitForAnimations(dialog);
 * dialog.close();
 */
export function waitForAnimations(element: HTMLElement | null): Promise<void> {
  return settleAnimations(awaitedAnimations(element));
}
