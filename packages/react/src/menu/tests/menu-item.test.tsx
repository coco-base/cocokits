// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Menu } from '../index';
import { Example, expectFocus, item, menu, stubTopLayer, trigger } from './fixtures';

beforeEach(stubTopLayer);
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
  window.location.hash = '';
});

const gone = (): Promise<void> =>
  waitFor(() => {
    expect(menu()).toBeNull();
  });

/** Presses an item with the way a user does it. */
async function press(how: 'click' | 'Enter' | 'Space', name: string): Promise<void> {
  if (how === 'click') {
    await userEvent.click(item(name));
    return;
  }
  item(name).focus();
  await userEvent.keyboard(how === 'Enter' ? '{Enter}' : ' ');
}

describe.each(['click', 'Enter', 'Space'] as const)('Menu item run with %s', (how) => {
  it('runs an enabled item once with a cancelable event of its own, then closes the menu', async () => {
    const onSelect = vi.fn<(event: Event) => void>();
    render(<Example onSelect={{ Duplicate: onSelect }} />);
    await userEvent.click(trigger());
    await expectFocus(item('Edit'));
    await press(how, 'Duplicate');
    await gone();
    expect(onSelect).toHaveBeenCalledOnce();
    const event = onSelect.mock.calls[0][0];
    expect(event.type).toBe('select');
    expect(event.cancelable).toBe(true);
  });

  it('keeps the menu open when the handler calls preventDefault', async () => {
    const onSelect = vi.fn((event: Event) => {
      event.preventDefault();
    });
    render(<Example onSelect={{ Duplicate: onSelect }} />);
    await userEvent.click(trigger());
    await expectFocus(item('Edit'));
    await press(how, 'Duplicate');
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(onSelect).toHaveBeenCalledOnce();
    expect(menu()).not.toBeNull();
  });

  it('runs nothing on a disabled item and keeps the menu open', async () => {
    const onSelect = vi.fn();
    render(<Example onSelect={{ Move: onSelect }} />);
    await userEvent.click(trigger());
    await expectFocus(item('Edit'));
    await press(how, 'Move');
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(onSelect).not.toHaveBeenCalled();
    expect(menu()).not.toBeNull();
    expect(item('Move').getAttribute('aria-disabled')).toBe('true');
  });

  it('keeps the click default of an item rendered as a link', async () => {
    const defaults: boolean[] = [];
    const record = (event: Event): void => {
      defaults.push(event.defaultPrevented);
    };
    document.addEventListener('click', record);
    render(
      <Menu.Root defaultOpen>
        <Menu.Trigger>Actions</Menu.Trigger>
        <Menu.Content>
          <Menu.Item render={<a href="#docs" />}>Docs</Menu.Item>
        </Menu.Content>
      </Menu.Root>,
    );
    await waitFor(() => {
      expect(menu()).not.toBeNull();
    });
    expect(item('Docs').tagName).toBe('A');
    await press(how, 'Docs');
    await gone();
    document.removeEventListener('click', record);
    expect(defaults).toEqual([false]);
    expect(window.location.hash).toBe('#docs');
  });
});

describe('Menu item event', () => {
  it('fires once for a click, not once for the click and once for the item', async () => {
    const onSelect = vi.fn();
    const onClick = vi.fn();
    render(
      <Menu.Root defaultOpen>
        <Menu.Trigger>Actions</Menu.Trigger>
        <Menu.Content>
          <Menu.Item onSelect={onSelect} onClick={onClick}>
            Edit
          </Menu.Item>
        </Menu.Content>
      </Menu.Root>,
    );
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Edit' }));
    expect(onSelect).toHaveBeenCalledOnce();
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('lets a consumer click handler veto the run with preventDefault', async () => {
    const onSelect = vi.fn();
    render(
      <Menu.Root defaultOpen>
        <Menu.Trigger>Actions</Menu.Trigger>
        <Menu.Content>
          <Menu.Item
            onSelect={onSelect}
            onClick={(event) => {
              event.preventDefault();
            }}
          >
            Edit
          </Menu.Item>
        </Menu.Content>
      </Menu.Root>,
    );
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Edit' }));
    expect(onSelect).not.toHaveBeenCalled();
    expect(menu()).not.toBeNull();
  });
});
