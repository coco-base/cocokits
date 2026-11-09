import type { Direction } from '@cocokits/shared';

/**
 * The direction the browser computes for an element. It sees an ancestor's `dir` and a `direction`
 * style. This is the default of every `getDirection` option, because a framework-free function has no
 * direction provider to ask.
 *
 * @param element - The element to read.
 * @returns `'rtl'` when the computed direction is right to left, otherwise `'ltr'`.
 */
export function computedDirection(element: Element): Direction {
  const view = element.ownerDocument.defaultView;
  return view?.getComputedStyle(element).direction === 'rtl' ? 'rtl' : 'ltr';
}
