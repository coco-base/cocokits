import { vi } from 'vitest';

/** The box `stubLayout` gives the anchor; the overlay content is 50 by 40 px. */
export const ANCHOR_BOX = { left: 300, top: 100, width: 100, height: 20 } as const;

/**
 * jsdom has no layout: give `anchor` a box (`ANCHOR_BOX`) and every other element 50 by 40 px in a 1000 by 800 px
 * viewport, so the position Floating UI writes can be read from the `left` of the content. Call it in a test;
 * `vi.restoreAllMocks()` in `afterEach` undoes the spies.
 *
 * @param anchor - Returns the element the content is placed against.
 */
export function stubLayout(anchor: () => Element | null): void {
  const box = (element: Element): { left: number; top: number; width: number; height: number } =>
    element === anchor() ? ANCHOR_BOX : { left: 0, top: 0, width: 50, height: 40 };
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    const { left, top, width, height } = box(this);
    return new DOMRect(left, top, width, height);
  });
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (this: HTMLElement) {
    return box(this).width;
  });
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (this: HTMLElement) {
    return box(this).height;
  });
  vi.spyOn(Element.prototype, 'clientWidth', 'get').mockReturnValue(1000);
  vi.spyOn(Element.prototype, 'clientHeight', 'get').mockReturnValue(800);
}

/**
 * Whether the placed content sits right of the anchor (`true`) or left of it (`false`), read from the `left` Floating
 * UI wrote on the element or its closest ancestor that has one.
 *
 * @param inside - An element inside the placed content.
 * @returns Where the content is, or `undefined` while it is not placed.
 */
export function placedRightOfAnchor(inside: Element): boolean | undefined {
  const placed = inside.closest<HTMLElement>('[style*="left"]');
  if (placed === null || placed.style.left === '0px') return undefined;
  const left = Number.parseFloat(placed.style.left);
  if (left >= ANCHOR_BOX.left + ANCHOR_BOX.width) return true;
  return left + 50 <= ANCHOR_BOX.left ? false : undefined;
}
