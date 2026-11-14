import { screen, waitFor } from '@testing-library/react';
import { StrictMode, type ReactElement } from 'react';
import { vi } from 'vitest';
import { Menu, type MenuContentProps, type MenuRootProps } from '../index';

/**
 * jsdom has no top layer: emulate `:modal` (a dialog with `data-modal`) and `showPopover`, which the portal host
 * needs. Call it in `beforeEach`; `vi.restoreAllMocks()` in `afterEach` undoes the spy.
 */
export function stubTopLayer(): void {
  const matches = Reflect.get(Element.prototype, 'matches') as (this: Element, selector: string) => boolean;
  vi.spyOn(Element.prototype, 'matches').mockImplementation(function (this: Element, selector: string) {
    if (selector === ':modal') return this.localName === 'dialog' && this.hasAttribute('data-modal');
    return matches.call(this, selector);
  });
  HTMLElement.prototype.showPopover = function (this: HTMLElement) {
    this.style.display = 'block';
  };
}

/**
 * `stubTopLayer` plus a modal `dialog`, which jsdom lacks: `showModal` opens the dialog, marks it modal and moves
 * focus into it, `close` closes it and fires `close`. The inert page is not emulated.
 */
export function stubModalTopLayer(): void {
  stubTopLayer();
  Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: 2000 });
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    if (!this.isConnected) throw new DOMException('Not connected', 'InvalidStateError');
    this.setAttribute('open', '');
    this.setAttribute('data-modal', '');
    this.querySelector<HTMLElement>('[autofocus], a[href], button, input, select, textarea')?.focus();
  };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    if (!this.hasAttribute('open')) return;
    this.removeAttribute('open');
    this.removeAttribute('data-modal');
    this.dispatchEvent(new Event('close'));
  };
}

/** The item names of {@link Example}, in order; `Move` is disabled. */
export const ITEMS = ['Edit', 'Duplicate', 'Move', 'Delete'] as const;

/** A menu with four items (the third disabled) and a separator, between two buttons of the page. */
export function Example({
  root,
  content,
  onSelect = {},
  items = ITEMS,
}: {
  readonly root?: MenuRootProps;
  readonly content?: MenuContentProps;
  readonly onSelect?: Partial<Record<string, (event: Event) => void>>;
  readonly items?: readonly string[];
}): ReactElement {
  return (
    <StrictMode>
      <button>before</button>
      <Menu.Root {...root}>
        <Menu.Trigger>Actions</Menu.Trigger>
        <Menu.Content {...content}>
          {items.map((name) => (
            <Menu.Item key={name} disabled={name === 'Move'} onSelect={onSelect[name]}>
              {name}
            </Menu.Item>
          ))}
          <hr />
        </Menu.Content>
      </Menu.Root>
      <button>after</button>
    </StrictMode>
  );
}

/** The menu button. */
export const trigger = (): HTMLElement => screen.getByRole('button', { name: 'Actions' });

/** The open menu, or null. */
export const menu = (): HTMLElement | null => screen.queryByRole('menu');

/** The menu item with the name. */
export const item = (name: string): HTMLElement => screen.getByRole('menuitem', { name });

/** Resolves once the element has focus (focus moves a frame after the open). */
export async function expectFocus(element: HTMLElement): Promise<void> {
  await waitFor(() => {
    if (document.activeElement !== element) {
      throw new Error(`focus is on ${document.activeElement?.outerHTML ?? 'nothing'}`);
    }
  });
}

/** Resolves after the next animation frame, where deferred focus runs. */
export const nextFrame = (): Promise<void> =>
  new Promise((resolve) =>
    requestAnimationFrame(() => {
      resolve();
    }),
  );

/**
 * jsdom has no layout: give the trigger `box` and every other element 50 by 40 px in a 1000 by 800 px viewport, so
 * the position that the content gets can be read. Call it in `beforeEach`; `vi.restoreAllMocks()` undoes the spies.
 *
 * @param box - The box of the trigger.
 */
export function stubLayout(box: { left: number; top: number; width: number; height: number }): void {
  const boxOf = (element: Element): typeof box =>
    element.classList.contains('cck-menu__trigger') ? box : { left: 0, top: 0, width: 50, height: 40 };
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    const { left, top, width, height } = boxOf(this);
    return new DOMRect(left, top, width, height);
  });
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (this: HTMLElement) {
    return boxOf(this).width;
  });
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (this: HTMLElement) {
    return boxOf(this).height;
  });
  vi.spyOn(Element.prototype, 'clientWidth', 'get').mockReturnValue(1000);
  vi.spyOn(Element.prototype, 'clientHeight', 'get').mockReturnValue(800);
}
