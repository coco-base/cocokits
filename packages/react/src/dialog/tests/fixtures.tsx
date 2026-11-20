import { screen, waitFor } from '@testing-library/react';
import { expect } from 'vitest';
import { StrictMode, type ReactElement } from 'react';
import { vi } from 'vitest';
import { Dialog } from '../index';

/**
 * jsdom has no top layer and no modal `dialog`: emulate `:modal` (a dialog with `data-modal`), `showPopover` (the
 * portal host), `showModal` (opens the dialog, marks it modal and moves focus the way the native focusing steps
 * do), `show` (opens it non-modal) and `close` (closes it and fires `close`). Call it in `beforeEach`; `vi.restoreAllMocks()` in `afterEach`
 * undoes the spy. The inert page is not emulated.
 */
export function stubTopLayer(): void {
  // jsdom has no layout: the page counts as scrolling, because the scroll lock does nothing for a page that fits.
  Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: 2000 });
  const matches = Reflect.get(Element.prototype, 'matches') as (this: Element, selector: string) => boolean;
  vi.spyOn(Element.prototype, 'matches').mockImplementation(function (this: Element, selector: string) {
    if (selector === ':modal') return this.localName === 'dialog' && this.hasAttribute('data-modal');
    return matches.call(this, selector);
  });
  HTMLElement.prototype.showPopover = function (this: HTMLElement) {
    this.style.display = 'block';
  };
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    if (!this.isConnected) throw new DOMException('Not connected', 'InvalidStateError');
    this.setAttribute('open', '');
    this.setAttribute('data-modal', '');
    this.querySelector<HTMLElement>('[autofocus], a[href], button, input, select, textarea')?.focus();
  };
  HTMLDialogElement.prototype.show = function (this: HTMLDialogElement) {
    if (!this.isConnected) throw new DOMException('Not connected', 'InvalidStateError');
    this.setAttribute('open', '');
    this.querySelector<HTMLElement>('[autofocus], a[href], button, input, select, textarea')?.focus();
  };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    if (!this.hasAttribute('open')) return;
    this.removeAttribute('open');
    this.removeAttribute('data-modal');
    this.dispatchEvent(new Event('close'));
  };
}

/** A dialog with a title, a description, a link and a Close, between two buttons of the page. */
export function Example({
  onOpenChange,
  open,
  defaultOpen,
}: {
  readonly onOpenChange?: (open: boolean, details: { reason: string; event: Event | null }) => void;
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
}): ReactElement {
  return (
    <StrictMode>
      <button>before</button>
      <Dialog.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
        <Dialog.Trigger>Delete</Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>Delete project</Dialog.Title>
          <Dialog.Description>This cannot be undone.</Dialog.Description>
          <a href="#first">First</a>
          <Dialog.Close>Cancel</Dialog.Close>
        </Dialog.Content>
      </Dialog.Root>
      <button>after</button>
    </StrictMode>
  );
}

/** Resolves after the next animation frame, where deferred focus runs. */
export const nextFrame = (): Promise<void> =>
  new Promise((resolve) =>
    requestAnimationFrame(() => {
      resolve();
    }),
  );

/** A pointer press that lands on the dialog element itself: with a position outside its box it is the backdrop. */
export function pressOn(target: HTMLElement, at: { clientX: number; clientY: number }): void {
  target.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true, composed: true, ...at }));
}

/** Gives the element a box, so a press can be inside or outside it. */
export function boxAt(element: HTMLElement): void {
  element.getBoundingClientRect = () => new DOMRect(100, 100, 200, 200);
}

/** A running CSS animation of 300 ms as `getAnimations()` returns it: the exit animation presence waits for. */
export function cssAnimation(finished: Promise<unknown>): Animation {
  return {
    finished,
    animationName: 'exit',
    playState: 'running',
    effect: { getComputedTiming: () => ({ endTime: 300 }) },
  } as unknown as Animation;
}

/** The trigger of the Delete dialog. */
export const trigger = (): HTMLElement => screen.getByRole('button', { name: 'Delete' });

/** The open dialog element, or null. */
export const content = (): HTMLDialogElement | null => screen.queryByRole<HTMLDialogElement>('dialog');

/** Whether the dialog is open. */
export const isOpen = (): boolean => content() !== null;

/** The button with the accessible name. */
export const button = (name: string): HTMLElement => screen.getByRole('button', { name });

/** Resolves once the dialog is closed. */
export const closed = (): Promise<void> =>
  waitFor(() => {
    expect(isOpen()).toBe(false);
  });
