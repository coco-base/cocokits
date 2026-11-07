/** What {@link hasInteractiveContent} reads of an element. */
export interface QueryableElement {
  /** Returns the first descendant that matches the selector, or `null`. */
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
 * Whether an element holds interactive content: a descendant a user can focus or operate. A Select option
 * is a `role="option"`, so its content must not contain any. Use it in a development check after mount; it
 * also works on an element that is not in the document.
 *
 * @param element - The element whose descendants are checked.
 * @returns `true` when a descendant is interactive.
 */
export function hasInteractiveContent(element: QueryableElement): boolean {
  return element.querySelector(INTERACTIVE) !== null;
}
