import { vi } from 'vitest';

/**
 * jsdom has no Popover API and no modal `dialog`. Stubs `showPopover` (shows the host), `showModal` (opens the
 * dialog and marks it `data-modal`), `close` (closes it and fires `close`, as the platform does) and the `:modal`
 * selector the portal asks. Nothing else is faked; the inert page and the top layer are not emulated. Call it in
 * `beforeEach` and `vi.restoreAllMocks()` in `afterEach`.
 */
export function stubOverlayApis(): void {
  // jsdom has no layout: the page counts as scrolling, because the scroll lock does nothing for a page that fits.
  Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: 2000 });
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
    if (!this.isConnected) throw new DOMException('Not connected', 'InvalidStateError');
    this.setAttribute('open', '');
    this.setAttribute('data-modal', '');
    // The native focusing steps: an `autofocus` element, else the first focusable one.
    this.querySelector<HTMLElement>('[autofocus], a[href], button, input, select, textarea')?.focus();
  };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    if (!this.hasAttribute('open')) return;
    this.removeAttribute('open');
    this.removeAttribute('data-modal');
    this.dispatchEvent(new Event('close'));
  };
}
