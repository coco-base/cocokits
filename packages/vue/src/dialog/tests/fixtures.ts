import { h, type Ref, type VNode } from 'vue';
import { vi } from 'vitest';
import { DialogClose, DialogContent, DialogDescription, DialogRoot, DialogTitle, DialogTrigger } from '../index';

export { mountView, view } from '../../internal/tests/mount-helpers';

/**
 * The browser features jsdom lacks and the overlay needs: the top layer (`showPopover`), the modal dialog
 * (`showModal` opens it, marks it `data-modal`; `show` opens it without, moves focus the way the native focusing steps do; `close` closes
 * it and fires `close`), the `:modal` selector and the resize observer. The inert page is not emulated. Call it in
 * `beforeEach`; `vi.restoreAllMocks()` and `vi.unstubAllGlobals()` in `afterEach`.
 */
export function stubOverlayBrowser(): void {
  // jsdom has no layout: the page counts as scrolling, because the scroll lock does nothing for a page that fits.
  Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: 2000 });
  const matches = Reflect.get(Element.prototype, 'matches') as (this: Element, selector: string) => boolean;
  vi.spyOn(Element.prototype, 'matches').mockImplementation(function (this: Element, selector: string) {
    if (selector === ':modal') return this.localName === 'dialog' && this.hasAttribute('data-modal');
    return matches.call(this, selector);
  });
  HTMLElement.prototype.showPopover = function showPopover(this: HTMLElement): void {
    this.style.display = 'block';
  };
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement): void {
    if (!this.isConnected) throw new DOMException('Not connected', 'InvalidStateError');
    this.setAttribute('open', '');
    this.setAttribute('data-modal', '');
    this.querySelector<HTMLElement>('[autofocus], a[href], button, input, select, textarea')?.focus();
  };
  HTMLDialogElement.prototype.show = function show(this: HTMLDialogElement): void {
    if (!this.isConnected) throw new DOMException('Not connected', 'InvalidStateError');
    this.setAttribute('open', '');
    this.querySelector<HTMLElement>('[autofocus], a[href], button, input, select, textarea')?.focus();
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement): void {
    if (!this.hasAttribute('open')) return;
    this.removeAttribute('open');
    this.removeAttribute('data-modal');
    this.dispatchEvent(new Event('close'));
  };
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    },
  );
}

/** Lets the portal host, the post-render effects and the animation frame (focus move) settle. */
export async function settle(): Promise<void> {
  for (let round = 0; round < 3; round += 1) {
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
}

/** A pointer press that lands on the dialog element itself: with a position outside its box it is the backdrop. */
export function pressOn(target: HTMLElement, at: { clientX: number; clientY: number }): void {
  target.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true, composed: true, ...at }));
}

/** Gives the element a box, so a press can be inside or outside it. */
export function boxAt(element: HTMLElement): void {
  element.getBoundingClientRect = () => new DOMRect(100, 100, 200, 200);
}

/** A dialog with a trigger and a content that holds a title, a description, a link and a Close, between two buttons. */
export function dialogView(options: {
  open?: Ref<boolean>;
  rootProps?: Record<string, unknown>;
  contentProps?: Record<string, unknown>;
  inner?: () => VNode | VNode[];
}): () => VNode[] {
  const state = options.open;
  return () => [
    h('button', { id: 'before' }, 'before'),
    h(
      DialogRoot,
      {
        ...(state ? { open: state.value, 'onUpdate:open': (value: boolean) => (state.value = value) } : {}),
        ...options.rootProps,
      },
      () => [
        h(DialogTrigger, null, () => 'Delete'),
        h(DialogContent, options.contentProps ?? null, () =>
          options.inner
            ? options.inner()
            : [
                h(DialogTitle, null, () => 'Delete project'),
                h(DialogDescription, null, () => 'This cannot be undone.'),
                h('a', { href: '#first' }, 'First'),
                h(DialogClose, null, () => 'Cancel'),
              ],
        ),
      ],
    ),
    h('button', { id: 'after' }, 'after'),
  ];
}
