import { vi } from 'vitest';

/**
 * jsdom has no Popover API and rejects the `:modal` selector the portal asks. Stubs both (and the visible state of an open popover) for one test;
 * call it in `beforeEach` and `vi.restoreAllMocks()` in `afterEach`. Nothing else is faked.
 */
export function stubOverlayApis(): void {
  const matches = Object.getOwnPropertyDescriptor(Element.prototype, 'matches')?.value as (
    this: Element,
    selector: string,
  ) => boolean;
  vi.spyOn(Element.prototype, 'matches').mockImplementation(function (this: Element, selector: string) {
    return selector === ':modal' ? false : matches.call(this, selector);
  });
  // jsdom hides `[popover]` until it is open; the stub opens it the way the user-agent style would show it.
  HTMLElement.prototype.showPopover = function (this: HTMLElement) {
    this.style.display = 'block';
  };
  HTMLElement.prototype.hidePopover = vi.fn();
}
