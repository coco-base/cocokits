// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, screen } from '@testing-library/vue';
import { h } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from '../index';
import { item, menu, menuView, mountView, open, settle, stubOverlayBrowser, trigger } from './fixtures';

beforeEach(stubOverlayBrowser);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const HOWS = [
  ['a click', async () => userEvent.click(item('Edit'))],
  ['Enter', async () => userEvent.keyboard('{Enter}')],
  ['Space', async () => userEvent.keyboard(' ')],
] as const;

describe.each(HOWS)('Menu item run by %s', (_name, run) => {
  it('emits select once with a cancelable event that is not the click, then closes the menu', async () => {
    const onSelect = vi.fn();
    const onOpen = vi.fn();
    mountView(menuView({ rootProps: { 'onUpdate:open': onOpen }, itemProps: { Edit: { onSelect } } }));
    await open();
    await run();
    await settle();
    expect(onSelect).toHaveBeenCalledTimes(1);
    const event = onSelect.mock.calls[0]?.[0] as Event;
    expect(event.type).toBe('select');
    expect(event.cancelable).toBe(true);
    expect(menu()).toBeNull();
    expect(onOpen.mock.calls).toEqual([[true], [false]]);
  });

  it('keeps the menu open when a select listener calls preventDefault()', async () => {
    mountView(
      menuView({
        itemProps: {
          Edit: {
            onSelect: (event: Event) => {
              event.preventDefault();
            },
          },
        },
      }),
    );
    await open();
    await run();
    await settle();
    expect(menu()).not.toBeNull();
    expect(document.activeElement).toBe(item('Edit'));
  });

  it('keeps the menu open when the select listener is written with .prevent', async () => {
    mountView(() => [
      h(MenuRoot, null, () => [
        h(MenuTrigger, null, () => 'Actions'),
        h(MenuContent, null, () =>
          h(
            MenuItem,
            {
              onSelect: (event: Event) => {
                event.preventDefault();
              },
            },
            () => 'Edit',
          ),
        ),
      ]),
    ]);
    await open();
    await run();
    await settle();
    expect(menu()).not.toBeNull();
  });
});

describe('Menu disabled item', () => {
  it.each(['a click', 'Enter', 'Space'])('runs nothing on %s and stays open and focused', async (how) => {
    const onSelect = vi.fn();
    const onClick = vi.fn();
    mountView(menuView({ itemProps: { Move: { onSelect, onClick } } }));
    await open();
    if (how === 'a click') await userEvent.click(item('Move'));
    else {
      item('Move').focus();
      await userEvent.keyboard(how === 'Enter' ? '{Enter}' : ' ');
    }
    await settle();
    expect(onSelect).not.toHaveBeenCalled();
    expect(menu()).not.toBeNull();
    expect(document.activeElement).toBe(item('Move'));
  });

  it('is reached by the pointer too: it holds focus on a click', async () => {
    mountView(menuView());
    await open();
    await userEvent.click(item('Move'));
    expect(item('Move').getAttribute('tabindex')).toBe('0');
  });
});

describe('Menu item click listeners', () => {
  it('a click listener that calls preventDefault() stops the item from running', async () => {
    const onSelect = vi.fn();
    mountView(
      menuView({
        itemProps: {
          Edit: {
            onSelect,
            onClick: (event: Event) => {
              event.preventDefault();
            },
          },
        },
      }),
    );
    await open();
    await userEvent.click(item('Edit'));
    await settle();
    expect(onSelect).not.toHaveBeenCalled();
    expect(menu()).not.toBeNull();
  });
});

describe('Menu item rendered as a link', () => {
  const link = (): HTMLElement => screen.getByRole('menuitem', { name: 'Settings' });

  function linkMenu(onSelect: (event: Event) => void): () => ReturnType<typeof h>[] {
    return () => [
      h(MenuRoot, null, () => [
        h(MenuTrigger, null, () => 'Actions'),
        h(MenuContent, null, () =>
          h(MenuItem, { asChild: true, onSelect }, () => h('a', { href: '#settings' }, 'Settings')),
        ),
      ]),
    ];
  }

  it.each(HOWS.filter(([name]) => name !== 'a click'))(
    'keeps the click default of the link when %s runs it',
    async (name) => {
      const onSelect = vi.fn();
      const clicks: boolean[] = [];
      document.addEventListener('click', (event) => clicks.push(event.defaultPrevented));
      mountView(linkMenu(onSelect));
      await open();
      const anchor = link();
      expect(anchor.getAttribute('href')).toBe('#settings');
      expect(anchor.className).toContain('cck-menu__item');
      await userEvent.keyboard(name === 'Enter' ? '{Enter}' : ' ');
      await settle();
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(clicks).toEqual([false, false]);
      expect(menu()).toBeNull();
      expect(trigger()).toBe(document.activeElement);
    },
  );

  it('keeps the click default when a pointer click runs it', async () => {
    const onSelect = vi.fn();
    const clicks: boolean[] = [];
    document.addEventListener('click', (event) => clicks.push(event.defaultPrevented));
    mountView(linkMenu(onSelect));
    await open();
    await userEvent.click(link());
    await settle();
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(clicks.at(-1)).toBe(false);
  });
});
