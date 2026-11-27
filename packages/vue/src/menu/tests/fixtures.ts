import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/vue';
import { vi } from 'vitest';
import { defineComponent, h, ref, type Component, type Ref, type VNode } from 'vue';
import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from '../index';

export { mountView, view } from '../../internal/tests/mount-helpers';

/** The element with the id; fails the test when there is none. */
export function byId(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (!element) throw new Error(`No element has the id ${id}`);
  return element;
}

/**
 * The browser features jsdom lacks and the overlay needs: the top layer, a modal `dialog` and the resize
 * observer. Call it in `beforeEach`; `vi.unstubAllGlobals()` and `vi.restoreAllMocks()` in `afterEach`.
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
    this.setAttribute('open', '');
    this.setAttribute('data-modal', '');
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

/** The items of the sample menu: the third one is disabled. */
export const ITEMS = ['Edit', 'Duplicate', 'Move', 'Delete'] as const;

/** What {@link menuView} takes. */
export interface MenuViewOptions {
  readonly open?: Ref<boolean> | undefined;
  readonly rootProps?: Record<string, unknown> | undefined;
  readonly contentProps?: Record<string, unknown> | undefined;
  /** Props of one item by its text. */
  readonly itemProps?: Readonly<Record<string, Record<string, unknown>>> | undefined;
  /** The items; the default is {@link ITEMS}. */
  readonly items?: (() => VNode[]) | undefined;
}

/** A menu with a trigger, items (`Move` disabled), a button before it and a button after it. */
export function menuView(options: MenuViewOptions = {}): () => VNode[] {
  const state = options.open;
  return () => [
    h('button', { id: 'before' }, 'before'),
    h(
      MenuRoot,
      {
        ...(state ? { open: state.value, 'onUpdate:open': (value: boolean) => (state.value = value) } : {}),
        ...options.rootProps,
      },
      () => [
        h(MenuTrigger, null, () => 'Actions'),
        h(MenuContent, options.contentProps ?? {}, () =>
          options.items
            ? options.items()
            : ITEMS.map((text) => h(MenuItem, { disabled: text === 'Move', ...options.itemProps?.[text] }, () => text)),
        ),
      ],
    ),
    h('button', { id: 'after' }, 'after'),
  ];
}

/** A component that holds a controlled `open` ref and renders {@link menuView}. */
export function controlled(openRef: Ref<boolean> = ref(false)): { Component: Component; open: Ref<boolean> } {
  return { open: openRef, Component: defineComponent({ setup: () => menuView({ open: openRef }) }) };
}

/** The button that opens the menu. */
export const trigger = (): HTMLElement => screen.getByRole('button', { name: 'Actions' });

/** The open menu, or null. */
export const menu = (): HTMLElement | null => screen.queryByRole('menu');

/** The item with the text. */
export const item = (name: string): HTMLElement => screen.getByRole('menuitem', { name });

/** Opens the menu with a click on the trigger and waits for the update. */
export async function open(): Promise<void> {
  await userEvent.click(trigger());
  await settle();
}

/** Types the keys, then waits for focus to settle. */
export async function press(keys: string): Promise<void> {
  await userEvent.keyboard(keys);
  await settle();
}
