// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup } from '@testing-library/vue';
import { h, ref } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as entry from '../index';
import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from '../index';
import { ITEMS, item, menu, menuView, mountView, open, settle, stubOverlayBrowser, trigger } from './fixtures';

beforeEach(stubOverlayBrowser);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const tabStops = (): string[] =>
  Array.from(document.querySelectorAll('[role="menuitem"]'))
    .filter((element) => element.getAttribute('tabindex') === '0')
    .map((element) => element.textContent);

describe('@cocokits/vue/menu entry', () => {
  it('exports the four parts', () => {
    expect(Object.keys(entry).sort()).toEqual(['MenuContent', 'MenuItem', 'MenuRoot', 'MenuTrigger']);
  });
});

describe('Menu anatomy', () => {
  it('renders the trigger alone while closed: a button with the state markers, no content', () => {
    const { container } = mountView(menuView());
    const button = trigger();
    expect(container.querySelector('.cck-menu__trigger')).toBe(button);
    expect(button.tagName).toBe('BUTTON');
    expect(button.getAttribute('type')).toBe('button');
    expect(button.getAttribute('aria-haspopup')).toBe('menu');
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(button.getAttribute('data-state')).toBe('closed');
    expect(button.hasAttribute('aria-controls')).toBe(false);
    expect(menu()).toBeNull();
    expect(document.querySelector('.cck-menu__content')).toBeNull();
  });

  it('renders the root without an element of its own', () => {
    const { container } = mountView(menuView());
    expect(Array.from(container.children).map((element) => element.className || element.id)).toEqual([
      'before',
      'cck-menu__trigger',
      'after',
    ]);
    expect(container.querySelector('.cck-menu')).toBeNull();
  });

  it('renders the content portaled, with its role, id, name, placement and items', async () => {
    const { container } = mountView(menuView());
    await open();
    const content = menu();
    expect(content?.tagName).toBe('DIV');
    expect(content?.className).toContain('cck-menu__content');
    expect(container.contains(content)).toBe(false);
    expect(content?.getAttribute('tabindex')).toBe('-1');
    expect(content?.getAttribute('data-state')).toBe('open');
    expect(content?.getAttribute('data-side')).toBe('bottom');
    expect(content?.getAttribute('data-align')).toBe('start');
    expect(content?.getAttribute('aria-labelledby')).toBe(trigger().id);
    expect(trigger().getAttribute('aria-controls')).toBe(content?.id);
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(trigger().getAttribute('data-state')).toBe('open');
    const items = Array.from(content?.querySelectorAll('.cck-menu__item') ?? []);
    expect(items.map((element) => element.textContent)).toEqual([...ITEMS]);
    for (const element of items) {
      expect(element.tagName).toBe('DIV');
      expect(element.getAttribute('role')).toBe('menuitem');
    }
  });

  it('marks a disabled item with aria-disabled and data-disabled, and no other', async () => {
    mountView(menuView());
    await open();
    expect(item('Move').getAttribute('aria-disabled')).toBe('true');
    expect(item('Move').hasAttribute('data-disabled')).toBe(true);
    expect(item('Edit').hasAttribute('aria-disabled')).toBe(false);
    expect(item('Edit').hasAttribute('data-disabled')).toBe(false);
  });

  it('lets an author name on the content win over the trigger', async () => {
    mountView(menuView({ contentProps: { 'aria-label': 'Row actions' } }));
    await open();
    expect(menu()?.getAttribute('aria-label')).toBe('Row actions');
    expect(menu()?.hasAttribute('aria-labelledby')).toBe(false);
  });

  it('labels the content by the id an author gave the trigger', async () => {
    mountView(() => [
      h(MenuRoot, null, () => [
        h(MenuTrigger, { id: 'mine' }, () => 'Actions'),
        h(MenuContent, null, () => h(MenuItem, null, () => 'Edit')),
      ]),
    ]);
    await open();
    expect(trigger().id).toBe('mine');
    expect(menu()?.getAttribute('aria-labelledby')).toBe('mine');
  });

  it('passes native attributes and classes through to each part', async () => {
    mountView(() => [
      h(MenuRoot, null, () => [
        h(MenuTrigger, { class: 'mine', 'data-x': 't' }, () => 'Actions'),
        h(MenuContent, { class: 'mine', 'data-x': 'c' }, () =>
          h(MenuItem, { class: 'mine', 'data-x': 'i' }, () => 'Edit'),
        ),
      ]),
    ]);
    await open();
    for (const [element, part] of [
      [trigger(), 'trigger'],
      [menu(), 'content'],
      [item('Edit'), 'item'],
    ] as const) {
      expect(element?.classList.contains('mine')).toBe(true);
      expect(element?.className).toContain(`cck-menu__${part}`);
    }
    expect([trigger(), menu(), item('Edit')].map((element) => element?.getAttribute('data-x'))).toEqual([
      't',
      'c',
      'i',
    ]);
  });

  it('renders nothing in the overlay container once the menu is closed', async () => {
    mountView(menuView());
    await open();
    await userEvent.keyboard('{Escape}');
    await settle();
    expect(menu()).toBeNull();
    expect(document.querySelector('.cck-menu__content')).toBeNull();
    expect(document.querySelector('[popover]')).toBeNull();
  });
});

describe('Menu tab stop', () => {
  it('gives tabindex 0 to the item that has focus after opening, and -1 to the others', async () => {
    mountView(menuView());
    await open();
    expect(tabStops()).toEqual(['Edit']);
    expect(item('Duplicate').getAttribute('tabindex')).toBe('-1');
  });

  it.each([
    ['arrow keys', () => userEvent.keyboard('{ArrowDown}{ArrowDown}'), 'Move'],
    ['a pointer click that is kept open', () => userEvent.click(item('Move')), 'Move'],
    [
      'a script focus',
      () => {
        item('Delete').focus();
        return undefined;
      },
      'Delete',
    ],
  ])('follows focus from %s', async (_name, move, expected) => {
    mountView(menuView());
    await open();
    await move();
    await settle();
    expect(tabStops()).toEqual([expected]);
  });

  it('falls back to the first item when the active one is removed', async () => {
    const shown = ref(true);
    mountView(() => [
      h(MenuRoot, { defaultOpen: true }, () => [
        h(MenuTrigger, null, () => 'Actions'),
        h(MenuContent, null, () => [
          h(MenuItem, { key: 'a' }, () => 'Edit'),
          ...(shown.value ? [h(MenuItem, { key: 'b' }, () => 'Remove me')] : []),
          h(MenuItem, { key: 'c' }, () => 'Delete'),
        ]),
      ]),
    ]);
    await settle();
    item('Remove me').focus();
    await settle();
    expect(tabStops()).toEqual(['Remove me']);
    shown.value = false;
    await settle();
    expect(tabStops()).toEqual(['Edit']);
  });
});
