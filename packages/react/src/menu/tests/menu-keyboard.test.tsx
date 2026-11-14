// @vitest-environment jsdom
import { cleanup, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { DirectionProvider } from '@cocokits/react-core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Example, expectFocus, item, menu, stubTopLayer, trigger } from './fixtures';

beforeEach(stubTopLayer);
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

type Direction = 'ltr' | 'rtl';

const page = (dir: Direction, onSelect?: Record<string, (event: Event) => void>): ReactElement => (
  <DirectionProvider dir={dir}>
    <Example onSelect={onSelect} />
  </DirectionProvider>
);

/** Opens the menu with a key on the focused trigger and waits for the focus to land on the item. */
async function openWith(key: string, first: string): Promise<void> {
  trigger().focus();
  await userEvent.keyboard(key);
  await expectFocus(item(first));
}

describe.each<Direction>(['ltr', 'rtl'])('Menu keyboard (%s)', (dir) => {
  it.each([
    ['{Enter}', 'Edit'],
    [' ', 'Edit'],
    ['{ArrowDown}', 'Edit'],
    ['{ArrowUp}', 'Delete'],
  ])('trigger: %j opens the menu and focuses %s', async (key, target) => {
    render(page(dir));
    await openWith(key, target);
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
  });

  it('trigger: Enter and Space close an open menu', async () => {
    render(page(dir));
    trigger().focus();
    await userEvent.keyboard('{Enter}');
    await expectFocus(item('Edit'));
    trigger().focus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => {
      expect(menu()).toBeNull();
    });
  });

  it('menu: the arrows move to the next and previous item, disabled ones included, and wrap', async () => {
    render(page(dir));
    await openWith('{ArrowDown}', 'Edit');
    const path: [string, string][] = [
      ['{ArrowDown}', 'Duplicate'],
      ['{ArrowDown}', 'Move'],
      ['{ArrowDown}', 'Delete'],
      ['{ArrowDown}', 'Edit'],
      ['{ArrowUp}', 'Delete'],
      ['{ArrowUp}', 'Move'],
    ];
    for (const [key, name] of path) {
      await userEvent.keyboard(key);
      expect(document.activeElement).toBe(item(name));
    }
  });

  it('menu: Home and End focus the first and last item', async () => {
    render(page(dir));
    await openWith('{ArrowDown}', 'Edit');
    await userEvent.keyboard('{End}');
    expect(document.activeElement).toBe(item('Delete'));
    await userEvent.keyboard('{Home}');
    expect(document.activeElement).toBe(item('Edit'));
  });

  it('menu: a printable character focuses the next item that starts with it, disabled items included', async () => {
    render(page(dir));
    await openWith('{ArrowDown}', 'Edit');
    await userEvent.keyboard('m');
    expect(document.activeElement).toBe(item('Move'));
    await userEvent.keyboard('{Escape}');
  });

  it('menu: a longer search refines and Space inside a running search does not run the item', async () => {
    const onSelect = { Duplicate: vi.fn() };
    render(page(dir, onSelect));
    await openWith('{ArrowDown}', 'Edit');
    await userEvent.keyboard('d');
    expect(document.activeElement).toBe(item('Duplicate'));
    await userEvent.keyboard(' ');
    expect(onSelect.Duplicate).not.toHaveBeenCalled();
    expect(menu()).not.toBeNull();
  });

  it('menu item: Enter and Space run an enabled item, close the menu and return focus to the trigger', async () => {
    const onSelect = { Edit: vi.fn(), Duplicate: vi.fn() };
    render(page(dir, onSelect));
    await openWith('{ArrowDown}', 'Edit');
    await userEvent.keyboard('{Enter}');
    await waitFor(() => {
      expect(menu()).toBeNull();
    });
    expect(onSelect.Edit).toHaveBeenCalledOnce();
    await expectFocus(trigger());
    await openWith('{ArrowDown}', 'Edit');
    await userEvent.keyboard('{ArrowDown} ');
    await waitFor(() => {
      expect(menu()).toBeNull();
    });
    expect(onSelect.Duplicate).toHaveBeenCalledOnce();
  });

  it('menu item: Enter and Space run nothing on a disabled item', async () => {
    const onSelect = { Move: vi.fn() };
    render(page(dir, onSelect));
    await openWith('{ArrowDown}', 'Edit');
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    expect(document.activeElement).toBe(item('Move'));
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(onSelect.Move).not.toHaveBeenCalled();
    expect(menu()).not.toBeNull();
    expect(document.activeElement).toBe(item('Move'));
  });

  it('menu: Enter and Space on the content after the focused item was removed run nothing', async () => {
    const onSelect = { Duplicate: vi.fn() };
    const names = ['Edit', 'Duplicate', 'Move', 'Delete'];
    const { rerender } = render(<Example root={{ open: true }} onSelect={onSelect} />);
    await expectFocus(item('Edit'));
    rerender(<Example root={{ open: true }} onSelect={onSelect} items={names.filter((name) => name !== 'Edit')} />);
    await waitFor(() => {
      expect(document.activeElement).toBe(menu());
    });
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(onSelect.Duplicate).not.toHaveBeenCalled();
    expect(menu()).not.toBeNull();
  });

  it('menu: Escape closes the menu and focuses the trigger', async () => {
    render(page(dir));
    await openWith('{ArrowDown}', 'Edit');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(menu()).toBeNull();
    });
    await expectFocus(trigger());
  });

  it('menu: Tab closes the menu and focuses the element after the trigger', async () => {
    render(page(dir));
    await openWith('{ArrowDown}', 'Edit');
    await userEvent.tab();
    await waitFor(() => {
      expect(menu()).toBeNull();
    });
    expect(document.activeElement?.textContent).toBe('after');
  });

  it('menu: Shift+Tab closes the menu and focuses the trigger', async () => {
    render(page(dir));
    await openWith('{ArrowDown}', 'Edit');
    await userEvent.tab({ shift: true });
    await waitFor(() => {
      expect(menu()).toBeNull();
    });
    expect(document.activeElement).toBe(trigger());
  });

  it('leaves keys with Ctrl, Alt or Meta alone', async () => {
    render(page(dir));
    await openWith('{ArrowDown}', 'Edit');
    await userEvent.keyboard('{Control>}{ArrowDown}{/Control}{Alt>}{End}{/Alt}');
    expect(document.activeElement).toBe(item('Edit'));
  });
});
