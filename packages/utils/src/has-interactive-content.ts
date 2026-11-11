/** What {@link hasInteractiveContent} reads of an element. Any `Element` fits. */
export interface QueryableElement {
  /**
   * Finds the first descendant that matches the selector.
   * @param selectors - A CSS selector list.
   * @returns The first match, or `null` when there is none.
   */
  querySelector(selectors: string): unknown;
}

/** The elements a user can focus or operate: links, form controls, summaries, and anything with a tabindex. */
const INTERACTIVE = [
  'a[href]',
  'area[href]',
  'button',
  'input:not([type="hidden"])',
  'select',
  'textarea',
  'summary',
  'audio[controls]',
  'video[controls]',
  '[tabindex]',
  '[contenteditable]:not([contenteditable="false"])',
].join(',');

/**
 * Checks whether an element holds interactive content, which is a descendant that a user can focus or operate.
 * Use it for an element that must not hold any, such as an item with `role="option"`.
 *
 * @remarks
 * Use it in a development check. It also works on an element that is not in the document.
 *
 * @param element - The element whose descendants are checked.
 * @returns `true` when a descendant is interactive.
 * @example
 * const option = document.querySelector<HTMLElement>('[role="option"]')!;
 * if (hasInteractiveContent(option)) console.warn('An option must not hold a button or a link.');
 */
export function hasInteractiveContent(element: QueryableElement): boolean {
  return element.querySelector(INTERACTIVE) !== null;
}
