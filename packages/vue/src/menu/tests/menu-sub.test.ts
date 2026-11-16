// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, screen } from '@testing-library/vue';
import { defineComponent, h, type VNode } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { provideDirection } from '@cocokits/vue-core';
import { MenuItem, MenuSub, MenuSubContent, MenuSubTrigger } from '../index';
import { item, menu, menuView, mountView, open, press, settle, stubOverlayBrowser, trigger } from './fixtures';

beforeEach(stubOverlayBrowser);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const onEmail = vi.fn();

/** Edit, a submenu Share with Email and Link, and Delete. */
function submenuItems(
  subProps: Record<string, unknown> = {},
  triggerProps: Record<string, unknown> = {},
): () => VNode[] {
  return () => [
    h(MenuItem, null, () => 'Edit'),
    h(MenuSub, subProps, () => [
      h(MenuSubTrigger, triggerProps, () => 'Share'),
      h(MenuSubContent, null, () => [
        h(MenuItem, { onSelect: onEmail }, () => 'Email'),
        h(MenuItem, null, () => 'Link'),
      ]),
    ]),
    h(MenuItem, null, () => 'Delete'),
  ];
}

const subTrigger = (): HTMLElement => item('Share');
const menus = (): HTMLElement[] => screen.queryAllByRole('menu');
const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/** Opens the menu and moves to the sub-trigger. */
async function toSubTrigger(): Promise<void> {
  await open();
  await press('{ArrowDown}');
  expect(document.activeElement).toBe(subTrigger());
}

describe('Menu sub-trigger and sub-content (menu-07)', () => {
  it('renders the sub-trigger as a menuitem that opens a menu, closed at first', async () => {
    mountView(menuView({ items: submenuItems() }));
    await open();
    expect(subTrigger().className).toBe('cck-menu__sub-trigger');
    expect(subTrigger().getAttribute('role')).toBe('menuitem');
    expect(subTrigger().getAttribute('aria-haspopup')).toBe('menu');
    expect(subTrigger().getAttribute('aria-expanded')).toBe('false');
    expect(subTrigger().hasAttribute('aria-controls')).toBe(false);
    expect(subTrigger().getAttribute('data-state')).toBe('closed');
    expect(menus()).toHaveLength(1);
  });

  it('reaches the sub-trigger with the arrows like any item', async () => {
    mountView(menuView({ items: submenuItems() }));
    await open();
    expect(document.activeElement).toBe(item('Edit'));
    await press('{ArrowDown}');
    expect(document.activeElement).toBe(subTrigger());
    await press('{ArrowDown}');
    expect(document.activeElement).toBe(item('Delete'));
  });

  it.each([['{ArrowRight}'], ['{Enter}'], [' ']])('opens with %s and focuses its first item', async (keys) => {
    mountView(menuView({ items: submenuItems() }));
    await toSubTrigger();
    await press(keys);
    expect(menus()).toHaveLength(2);
    expect(subTrigger().getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement).toBe(item('Email'));
    const sub = menus()[1];
    expect(sub.className).toBe('cck-menu__sub-content');
    expect(sub.getAttribute('aria-labelledby')).toBe(subTrigger().id);
    expect(subTrigger().getAttribute('aria-controls')).toBe(sub.id);
    expect(sub.getAttribute('data-state')).toBe('open');
    expect(sub.hasAttribute('data-side')).toBe(true);
  });

  it('moves between the items of the submenu only, and ArrowLeft closes it and returns focus to the sub-trigger', async () => {
    mountView(menuView({ items: submenuItems() }));
    await toSubTrigger();
    await press('{ArrowRight}');
    await press('{ArrowDown}');
    expect(document.activeElement).toBe(item('Link'));
    await press('{ArrowDown}');
    expect(document.activeElement).toBe(item('Email'));
    await press('{ArrowLeft}');
    expect(menus()).toHaveLength(1);
    expect(document.activeElement).toBe(subTrigger());
    expect(menu()).not.toBeNull();
  });

  it('closes only the submenu on Escape and returns focus to the sub-trigger', async () => {
    mountView(menuView({ items: submenuItems() }));
    await toSubTrigger();
    await press('{ArrowRight}');
    await press('{Escape}');
    expect(menus()).toHaveLength(1);
    expect(document.activeElement).toBe(subTrigger());
    await press('{Escape}');
    expect(menus()).toHaveLength(0);
  });

  it('flips the keys in right-to-left: ArrowLeft opens and ArrowRight closes', async () => {
    const Page = defineComponent({
      setup() {
        provideDirection('rtl');
        return menuView({ items: submenuItems() });
      },
    });
    mountView(() => [h(Page)]);
    await toSubTrigger();
    await press('{ArrowRight}');
    expect(menus()).toHaveLength(1);
    await press('{ArrowLeft}');
    expect(menus()).toHaveLength(2);
    await press('{ArrowRight}');
    expect(menus()).toHaveLength(1);
    expect(document.activeElement).toBe(subTrigger());
  });

  it('a press on an item of the submenu runs it and closes the whole menu', async () => {
    onEmail.mockClear();
    mountView(menuView({ items: submenuItems() }));
    await toSubTrigger();
    await press('{ArrowRight}');
    await userEvent.click(item('Email'));
    expect(onEmail).toHaveBeenCalledOnce();
    await settle();
    expect(menus()).toHaveLength(0);
    expect(document.activeElement).toBe(trigger());
  });

  it('opens when the pointer rests on the sub-trigger and closes when it moves to another item', async () => {
    mountView(menuView({ items: submenuItems() }));
    await open();
    await userEvent.hover(subTrigger());
    expect(menus()).toHaveLength(1);
    await wait(180);
    expect(menus()).toHaveLength(2);
    // The pointer did not move the focus into the submenu.
    expect(document.activeElement).not.toBe(item('Email'));
    await userEvent.hover(item('Delete'));
    expect(menus()).toHaveLength(1);
    expect(subTrigger().getAttribute('aria-expanded')).toBe('false');
  });

  it('does not open from a pointer that only passes over the sub-trigger', async () => {
    mountView(menuView({ items: submenuItems() }));
    await open();
    await userEvent.hover(subTrigger());
    await userEvent.hover(item('Delete'));
    await wait(180);
    expect(menus()).toHaveLength(1);
  });

  it('opens with a click on the sub-trigger and keeps the parent menu open', async () => {
    mountView(menuView({ items: submenuItems() }));
    await open();
    await userEvent.click(subTrigger());
    expect(menus()).toHaveLength(2);
    await userEvent.click(subTrigger());
    expect(menus().length).toBeGreaterThan(0);
  });

  it('never opens from a disabled sub-trigger, which stays focusable', async () => {
    mountView(menuView({ items: submenuItems({}, { disabled: true }) }));
    await toSubTrigger();
    expect(subTrigger().getAttribute('aria-disabled')).toBe('true');
    expect(subTrigger().hasAttribute('data-disabled')).toBe(true);
    await press('{ArrowRight}');
    await press('{Enter}');
    await userEvent.click(subTrigger());
    expect(menus()).toHaveLength(1);
  });

  it('follows a bound open state of the submenu', async () => {
    const onOpen = vi.fn();
    mountView(menuView({ items: submenuItems({ open: true, 'onUpdate:open': onOpen }) }));
    await open();
    expect(menus()).toHaveLength(2);
    await press('{Escape}');
    expect(onOpen).toHaveBeenCalledWith(false);
  });

  it('uses its own typeahead and keeps the parent items out of the submenu', async () => {
    mountView(menuView({ items: submenuItems() }));
    await toSubTrigger();
    await press('{ArrowRight}');
    await press('l');
    expect(document.activeElement).toBe(item('Link'));
  });
});
