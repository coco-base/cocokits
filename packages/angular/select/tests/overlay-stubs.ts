import { vi } from 'vitest';

/**
 * jsdom has no Popover API, no modal `dialog` and no `scrollIntoView`, and it rejects the `:modal` selector the
 * portal asks. Stubs `showPopover` (shows the host), `showModal` and `close` of a dialog (marks it `data-modal`,
 * fires `close`), `:modal` and `scrollIntoView`. Nothing else is faked; the inert page and the top layer are
 * not emulated. Call it in `beforeEach` and `vi.restoreAllMocks()` in `afterEach`.
 *
 * @returns The `scrollIntoView` spy.
 */
export function stubOverlayApis(): ReturnType<typeof vi.fn> {
  const matches = Object.getOwnPropertyDescriptor(Element.prototype, 'matches')?.value as (
    this: Element,
    selector: string,
  ) => boolean;
  vi.spyOn(Element.prototype, 'matches').mockImplementation(function (this: Element, selector: string) {
    if (selector === ':modal') return this.localName === 'dialog' && this.hasAttribute('data-modal');
    return matches.call(this, selector);
  });
  HTMLElement.prototype.showPopover = function (this: HTMLElement) {
    this.style.display = 'block';
  };
  HTMLElement.prototype.hidePopover = vi.fn();
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
    this.setAttribute('data-modal', '');
  };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    if (!this.hasAttribute('open')) return;
    this.removeAttribute('open');
    this.removeAttribute('data-modal');
    this.dispatchEvent(new Event('close'));
  };
  const scrollIntoView = vi.fn();
  Element.prototype.scrollIntoView = scrollIntoView;
  return scrollIntoView;
}
