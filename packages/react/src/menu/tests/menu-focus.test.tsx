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
});

const ITEM_NAMES = ['Edit', 'Move'] as const;

/** Opens the menu with the trigger and waits for focus on the first item. */
async function open(onSelect: Record<string, (event: Event) => void> = {}): Promise<void> {
  render(<Example onSelect={onSelect} />);
  await userEvent.click(trigger());
  await expectFocus(item('Edit'));
}

const closed = (): Promise<void> =>
  waitFor(() => {
    expect(menu()).toBeNull();
  });

describe('Menu focus when the menu closes or the focused item goes away', () => {
  it.each(['click', 'Enter', 'Space'] as const)(
    'an enabled item run with %s returns focus to the trigger',
    async (how) => {
      const onSelect = { Edit: vi.fn() };
      await open(onSelect);
      if (how === 'click') await userEvent.click(item('Edit'));
      else await userEvent.keyboard(how === 'Enter' ? '{Enter}' : ' ');
      await closed();
      expect(onSelect.Edit).toHaveBeenCalledOnce();
      await expectFocus(trigger());
    },
  );

  it.each(['click', 'Enter', 'Space'] as const)('a prevented item run with %s keeps focus on the item', async (how) => {
    await open({
      Edit: (event) => {
        event.preventDefault();
      },
    });
    if (how === 'click') await userEvent.click(item('Edit'));
    else await userEvent.keyboard(how === 'Enter' ? '{Enter}' : ' ');
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(menu()).not.toBeNull();
    expect(document.activeElement).toBe(item('Edit'));
  });

  it.each(['click', 'Enter', 'Space'] as const)('a disabled item pressed with %s keeps focus on it', async (how) => {
    await open();
    item('Move').focus();
    if (how === 'click') await userEvent.click(item('Move'));
    else await userEvent.keyboard(how === 'Enter' ? '{Enter}' : ' ');
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(menu()).not.toBeNull();
    expect(document.activeElement).toBe(item('Move'));
  });

  it('Escape on an item returns focus to the trigger', async () => {
    await open();
    await userEvent.keyboard('{Escape}');
    await closed();
    await expectFocus(trigger());
  });

  it('Escape on a content with no items returns focus to the trigger', async () => {
    render(
      <Menu.Root>
        <Menu.Trigger>Actions</Menu.Trigger>
        <Menu.Content />
      </Menu.Root>,
    );
    await userEvent.click(trigger());
    await expectFocus(screen.getByRole('menu'));
    await userEvent.keyboard('{Escape}');
    await closed();
    await expectFocus(trigger());
  });

  it('Tab moves focus to the element after the trigger', async () => {
    await open();
    await userEvent.tab();
    await closed();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'after' }));
  });

  it('Shift+Tab moves focus to the trigger', async () => {
    await open();
    await userEvent.tab({ shift: true });
    await closed();
    expect(document.activeElement).toBe(trigger());
  });

  it('a press on space that cannot take focus returns focus to the trigger', async () => {
    await open();
    await userEvent.click(document.body);
    await closed();
    await expectFocus(trigger());
  });

  it('a press on a focusable element outside moves focus to it', async () => {
    await open();
    await userEvent.click(screen.getByRole('button', { name: 'after' }));
    await closed();
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'after' }));
  });

  it('a click on the trigger leaves focus on the trigger', async () => {
    await open();
    await userEvent.click(trigger());
    await closed();
    await expectFocus(trigger());
  });

  it('the parent closing the menu returns focus from an item or from the content to the trigger', async () => {
    const { rerender } = render(<Example root={{ open: true }} />);
    await expectFocus(item('Edit'));
    rerender(<Example root={{ open: false }} />);
    await closed();
    await expectFocus(trigger());

    rerender(<Example root={{ open: true }} items={[]} />);
    await waitFor(() => {
      expect(document.activeElement).toBe(menu());
    });
    rerender(<Example root={{ open: false }} items={[]} />);
    await closed();
    await expectFocus(trigger());
  });

  it('removing the focused item while the menu stays open sends focus to the content', async () => {
    const { rerender } = render(<Example root={{ open: true }} />);
    await expectFocus(item('Edit'));
    rerender(<Example root={{ open: true }} items={ITEM_NAMES.filter((name) => name !== 'Edit')} />);
    await waitFor(() => {
      expect(document.activeElement).toBe(menu());
    });
    expect(menu()).not.toBeNull();
  });

  it('the parent closing the menu does not move focus that sits outside it', async () => {
    const { rerender } = render(<Example root={{ open: true }} />);
    await expectFocus(item('Edit'));
    const outside = screen.getByRole('button', { name: 'after' });
    outside.focus();
    rerender(<Example root={{ open: false }} />);
    await closed();
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(document.activeElement).toBe(outside);
  });
});
