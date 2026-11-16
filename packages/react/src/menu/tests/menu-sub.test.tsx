// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { DirectionProvider } from '@cocokits/react-core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Menu, type MenuSubChangeDetails } from '../index';
import { expectFocus, stubTopLayer, trigger } from './fixtures';

beforeEach(stubTopLayer);
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

function Nested({
  onOpenChange,
  onSelect,
  disabled = false,
  dir = 'ltr',
}: {
  readonly onOpenChange?: (open: boolean, details: MenuSubChangeDetails) => void;
  readonly onSelect?: () => void;
  readonly disabled?: boolean;
  readonly dir?: 'ltr' | 'rtl';
}): ReactElement {
  return (
    <DirectionProvider dir={dir}>
      <Menu.Root>
        <Menu.Trigger>Actions</Menu.Trigger>
        <Menu.Content>
          <Menu.Item>Edit</Menu.Item>
          <Menu.Sub onOpenChange={onOpenChange}>
            <Menu.SubTrigger disabled={disabled}>Share</Menu.SubTrigger>
            <Menu.SubContent>
              <Menu.Item onSelect={onSelect}>Email</Menu.Item>
              <Menu.Item>Link</Menu.Item>
            </Menu.SubContent>
          </Menu.Sub>
          <Menu.Item>Delete</Menu.Item>
        </Menu.Content>
      </Menu.Root>
    </DirectionProvider>
  );
}

const subTrigger = (): HTMLElement => screen.getByRole('menuitem', { name: 'Share' });
const subMenu = (): HTMLElement | null => screen.queryByRole('menu', { name: 'Share' });
const mainMenu = (): HTMLElement | null => document.querySelector<HTMLElement>('.cck-menu__content');

async function openMenu(): Promise<void> {
  await userEvent.click(trigger());
  await waitFor(() => {
    expect(mainMenu()).not.toBeNull();
  });
  // The focus lands on the first item a frame after the open; a test that moves it earlier would lose it.
  await expectFocus(screen.getByRole('menuitem', { name: 'Edit' }));
}

describe('Menu submenu parts', () => {
  it('renders the sub-trigger as a menuitem with the haspopup, expanded and controls facts', async () => {
    render(<Nested />);
    await openMenu();
    expect(subTrigger().className).toBe('cck-menu__sub-trigger');
    expect(subTrigger().getAttribute('aria-haspopup')).toBe('menu');
    expect(subTrigger().getAttribute('aria-expanded')).toBe('false');
    expect(subTrigger().getAttribute('data-state')).toBe('closed');
    expect(subTrigger().hasAttribute('aria-controls')).toBe(false);
    expect(subMenu()).toBeNull();
  });

  it('opens on a click, names the sub-content by the sub-trigger and links them', async () => {
    const onOpenChange = vi.fn<(open: boolean, details: MenuSubChangeDetails) => void>();
    render(<Nested onOpenChange={onOpenChange} />);
    await openMenu();
    await userEvent.click(subTrigger());
    await waitFor(() => {
      expect(subMenu()).not.toBeNull();
    });
    expect(onOpenChange).toHaveBeenCalledWith(true, expect.objectContaining({ reason: 'trigger' }));
    expect(subMenu()?.className).toBe('cck-menu__sub-content');
    expect(subMenu()?.getAttribute('aria-labelledby')).toBe(subTrigger().id);
    expect(subTrigger().getAttribute('aria-expanded')).toBe('true');
    expect(subTrigger().getAttribute('aria-controls')).toBe(subMenu()?.id);
    expect(mainMenu()).not.toBeNull();
    // A click leaves the focus where it was.
    expect(subMenu()?.contains(document.activeElement)).toBe(false);
  });

  it('does not run the sub-trigger like an item: the menu stays open', async () => {
    render(<Nested />);
    await openMenu();
    await userEvent.click(subTrigger());
    expect(mainMenu()).not.toBeNull();
  });
});

describe('Menu submenu keyboard', () => {
  it.each([
    ['ltr', '{ArrowRight}', '{ArrowLeft}'],
    ['rtl', '{ArrowLeft}', '{ArrowRight}'],
    ['ltr', '{Enter}', '{ArrowLeft}'],
    ['ltr', ' ', '{ArrowLeft}'],
  ] as const)('(%s) %s opens it on the first item and %s closes it with focus back', async (dir, open, close) => {
    render(<Nested dir={dir} />);
    await openMenu();
    subTrigger().focus();
    await userEvent.keyboard(open);
    await expectFocus(await screen.findByRole('menuitem', { name: 'Email' }));
    await userEvent.keyboard('{ArrowDown}');
    await expectFocus(await screen.findByRole('menuitem', { name: 'Link' }));
    await userEvent.keyboard(close);
    await waitFor(() => {
      expect(subMenu()).toBeNull();
    });
    await expectFocus(subTrigger());
    expect(mainMenu()).not.toBeNull();
  });

  it('closes only the submenu on Escape and returns the focus to the sub-trigger', async () => {
    const onOpenChange = vi.fn<(open: boolean, details: MenuSubChangeDetails) => void>();
    render(<Nested onOpenChange={onOpenChange} />);
    await openMenu();
    subTrigger().focus();
    await userEvent.keyboard('{ArrowRight}');
    await expectFocus(await screen.findByRole('menuitem', { name: 'Email' }));
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(subMenu()).toBeNull();
    });
    expect(mainMenu()).not.toBeNull();
    await expectFocus(subTrigger());
    expect(onOpenChange).toHaveBeenLastCalledWith(false, expect.objectContaining({ reason: 'escape' }));
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(mainMenu()).toBeNull();
    });
  });

  it('closes the whole menu when an item of the submenu runs', async () => {
    const onSelect = vi.fn();
    render(<Nested onSelect={onSelect} />);
    await openMenu();
    subTrigger().focus();
    await userEvent.keyboard('{ArrowRight}');
    await expectFocus(await screen.findByRole('menuitem', { name: 'Email' }));
    await userEvent.keyboard('{Enter}');
    await waitFor(() => {
      expect(mainMenu()).toBeNull();
    });
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(subMenu()).toBeNull();
  });

  it.each(['{ArrowRight}', '{Enter}'])(
    'never opens a disabled sub-trigger with %s, which stays focusable',
    async (key) => {
      render(<Nested disabled />);
      await openMenu();
      subTrigger().focus();
      await userEvent.keyboard(key);
      await userEvent.click(subTrigger());
      expect(subMenu()).toBeNull();
      expect(subTrigger().getAttribute('aria-disabled')).toBe('true');
      expect(subTrigger().hasAttribute('data-disabled')).toBe(true);
      expect(document.activeElement).toBe(subTrigger());
    },
  );

  it('reaches the sub-trigger with the arrow keys like any item', async () => {
    render(<Nested />);
    await openMenu();
    await expectFocus(screen.getByRole('menuitem', { name: 'Edit' }));
    await userEvent.keyboard('{ArrowDown}');
    await expectFocus(subTrigger());
  });
});

describe('Menu submenu pointer', () => {
  it('opens after the pointer rests on the sub-trigger, without moving the focus', async () => {
    const onOpenChange = vi.fn<(open: boolean, details: MenuSubChangeDetails) => void>();
    render(<Nested onOpenChange={onOpenChange} />);
    await openMenu();
    fireEvent.pointerMove(subTrigger());
    expect(subMenu()).toBeNull();
    await waitFor(() => {
      expect(subMenu()).not.toBeNull();
    });
    expect(onOpenChange).toHaveBeenCalledWith(true, expect.objectContaining({ reason: 'pointer' }));
    expect(subMenu()?.contains(document.activeElement)).toBe(false);
  });

  it('does not open when the pointer only passes over', async () => {
    render(<Nested />);
    await openMenu();
    fireEvent.pointerMove(subTrigger());
    fireEvent.pointerLeave(subTrigger());
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(subMenu()).toBeNull();
  });

  it('closes when the pointer moves to another item of the parent menu', async () => {
    const onOpenChange = vi.fn<(open: boolean, details: MenuSubChangeDetails) => void>();
    render(<Nested onOpenChange={onOpenChange} />);
    await openMenu();
    await userEvent.click(subTrigger());
    await waitFor(() => {
      expect(subMenu()).not.toBeNull();
    });
    fireEvent.pointerMove(screen.getByRole('menuitem', { name: 'Delete' }));
    await waitFor(() => {
      expect(subMenu()).toBeNull();
    });
    expect(onOpenChange).toHaveBeenLastCalledWith(false, expect.objectContaining({ reason: 'pointer' }));
    expect(mainMenu()).not.toBeNull();
  });

  it('stays open while the pointer moves inside the submenu', async () => {
    render(<Nested />);
    await openMenu();
    await userEvent.click(subTrigger());
    await waitFor(() => {
      expect(subMenu()).not.toBeNull();
    });
    fireEvent.pointerMove(screen.getByRole('menuitem', { name: 'Link' }));
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(subMenu()).not.toBeNull();
  });
});

describe('Menu submenu and its parent', () => {
  it('closes the submenu with the menu, and it starts closed when the menu opens again', async () => {
    render(<Nested />);
    await openMenu();
    await userEvent.click(subTrigger());
    await waitFor(() => {
      expect(subMenu()).not.toBeNull();
    });
    await userEvent.click(trigger());
    await waitFor(() => {
      expect(mainMenu()).toBeNull();
    });
    expect(subMenu()).toBeNull();
    await openMenu();
    expect(subMenu()).toBeNull();
  });

  it('closes both on a press outside', async () => {
    render(<Nested />);
    await openMenu();
    await userEvent.click(subTrigger());
    await waitFor(() => {
      expect(subMenu()).not.toBeNull();
    });
    await userEvent.click(document.body);
    await waitFor(() => {
      expect(mainMenu()).toBeNull();
    });
    expect(subMenu()).toBeNull();
  });
});

describe('Menu submenu placement', () => {
  it('puts its top-start corner at the bottom-end corner of the sub-trigger', async () => {
    const box = { left: 300, top: 100, width: 100, height: 20 };
    const boxOf = (element: Element): typeof box =>
      element.classList.contains('cck-menu__sub-trigger') ? box : { left: 0, top: 0, width: 50, height: 40 };
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
    render(<Nested />);
    await openMenu();
    await userEvent.click(subTrigger());
    await waitFor(() => {
      expect(subMenu()?.getAttribute('data-side')).toBe('bottom');
    });
    await waitFor(() => {
      expect(Number.parseFloat(subMenu()?.style.left ?? 'NaN')).toBe(box.left + box.width);
    });
    expect(subMenu()?.getAttribute('data-align')).toBe('start');
  });
});
