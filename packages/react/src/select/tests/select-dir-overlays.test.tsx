// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactElement } from 'react';
import { selectAnatomy } from '@cocokits/machines/select';
import { DirectionProvider } from '@cocokits/react-core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Dialog } from '../../dialog';
import { Popover } from '../../popover';
import { active, ANCHOR_BOX, Dishes, gone, nextTask, Opt, stubLayout, stubTopLayer, trigger } from './fixtures';

const { classes } = selectAnatomy;

beforeEach(() => {
  stubTopLayer();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('Select right to left', () => {
  it('flips start and end placement, and leaves the vertical keys alone', async () => {
    const user = userEvent.setup();
    render(
      <DirectionProvider dir="rtl">
        <Dishes contentProps={{ side: 'start' }}>
          <Opt value="Cake">Cake</Opt>
          <Opt value="Pizza">Pizza</Opt>
        </Dishes>
      </DirectionProvider>,
    );
    await user.tab();
    await user.keyboard('{ArrowDown}');
    const list = await screen.findByRole('listbox');
    await waitFor(() => {
      expect(list.getAttribute('data-side')).toBe('start');
    });
    await user.keyboard('{ArrowDown}');
    expect(active()).toBe('Pizza');
    await user.keyboard('{ArrowUp}');
    expect(active()).toBe('Cake');
  });
});

describe('Select dir', () => {
  const dishes = (dir?: 'ltr' | 'rtl'): ReactElement => (
    <DirectionProvider dir="ltr">
      <Dishes contentProps={{ side: 'start' }} dir={dir}>
        <Opt value="Cake">Cake</Opt>
      </Dishes>
    </DirectionProvider>
  );

  it('renders only the own dir on the root and reaches the portaled list', async () => {
    const user = userEvent.setup();
    const { container } = render(dishes('rtl'));
    expect(container.querySelector(`.${classes.root}`)?.getAttribute('dir')).toBe('rtl');
    await user.tab();
    await user.keyboard('{ArrowDown}');
    const list = await screen.findByRole('listbox');
    await waitFor(() => {
      expect(list.getAttribute('data-side')).toBe('start');
    });
    expect(list.closest('[popover]')?.getAttribute('dir')).toBe('rtl');
  });

  it.each([
    { dir: 'rtl' as const, right: true },
    { dir: 'ltr' as const, right: false },
  ])('places side="start" on the $dir side of the trigger by the own dir', async ({ dir, right }) => {
    stubLayout(() => document.querySelector('[role="combobox"]'));
    const user = userEvent.setup();
    render(
      <DirectionProvider dir={dir === 'rtl' ? 'ltr' : 'rtl'}>
        <Dishes contentProps={{ side: 'start' }} dir={dir}>
          <Opt value="Cake">Cake</Opt>
        </Dishes>
      </DirectionProvider>,
    );
    await user.tab();
    await user.keyboard('{ArrowDown}');
    const list = await screen.findByRole('listbox');
    const placed = (): HTMLElement | null => list.closest<HTMLElement>('[style*="left"]');
    await waitFor(() => {
      expect(placed()?.style.left).not.toBe('0px');
    });
    const left = Number.parseFloat(placed()?.style.left ?? '');
    if (right) expect(left).toBeGreaterThanOrEqual(ANCHOR_BOX.left + ANCHOR_BOX.width);
    else expect(left + 50).toBeLessThanOrEqual(ANCHOR_BOX.left);
  });

  it('renders no dir attribute without it', () => {
    const { container } = render(dishes());
    expect(container.querySelector(`.${classes.root}`)?.hasAttribute('dir')).toBe(false);
  });
});

describe('Select nested overlays', () => {
  it('inside a Popover: Escape closes the listbox only, and a choice keeps the Popover open', async () => {
    const user = userEvent.setup();
    render(
      <Popover.Root>
        <Popover.Trigger>Settings</Popover.Trigger>
        <Popover.Content aria-label="Settings panel">
          <Dishes>
            <Opt value="Cake">Cake</Opt>
            <Opt value="Pizza">Pizza</Opt>
          </Dishes>
        </Popover.Content>
      </Popover.Root>,
    );
    await user.click(screen.getByRole('button', { name: 'Settings' }));
    await screen.findByRole('dialog', { name: 'Settings panel' });
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'Pizza' }));
    await gone();
    expect(screen.getByRole('dialog', { name: 'Settings panel' })).toBeTruthy();
    await user.click(trigger());
    await screen.findByRole('listbox');
    await user.keyboard('{Escape}');
    await gone();
    expect(screen.getByRole('dialog', { name: 'Settings panel' })).toBeTruthy();
  });

  it('inside a Popover: a press outside that the list refuses with cancel() keeps the Popover open', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn((open: boolean, details: { cancel(): void }) => {
      if (!open) details.cancel();
    });
    render(
      <>
        <button>Elsewhere</button>
        <Popover.Root>
          <Popover.Trigger>Settings</Popover.Trigger>
          <Popover.Content aria-label="Settings panel">
            <Dishes onOpenChange={onOpenChange}>
              <Opt value="Cake">Cake</Opt>
            </Dishes>
          </Popover.Content>
        </Popover.Root>
      </>,
    );
    await user.click(screen.getByRole('button', { name: 'Settings' }));
    await screen.findByRole('dialog', { name: 'Settings panel' });
    await user.click(trigger());
    await screen.findByRole('listbox');
    await user.click(screen.getByRole('button', { name: 'Elsewhere' }));
    await nextTask();
    expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything());
    expect(screen.getByRole('listbox')).toBeTruthy();
    expect(screen.getByRole('dialog', { name: 'Settings panel' })).toBeTruthy();
  });

  it('inside a modal Dialog: the list renders inside the dialog, Escape closes it only, a choice keeps the dialog open', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Dialog.Root>
        <Dialog.Trigger>Order</Dialog.Trigger>
        <Dialog.Content aria-label="Order">
          <Dishes onValueChange={onValueChange}>
            <Opt value="Cake">Cake</Opt>
            <Opt value="Pizza">Pizza</Opt>
          </Dishes>
          <Dialog.Close>Cancel</Dialog.Close>
        </Dialog.Content>
      </Dialog.Root>,
    );
    await user.click(screen.getByRole('button', { name: 'Order' }));
    const dialog = await waitFor(() => {
      const found = document.querySelector('dialog[open]');
      if (!found) throw new Error('The dialog is not open yet.');
      return found;
    });
    await user.click(trigger());
    const list = await screen.findByRole('listbox');
    expect(dialog.contains(list)).toBe(true);
    await user.keyboard('{Escape}');
    await gone();
    expect(document.querySelector('dialog[open]')).toBe(dialog);
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'Pizza' }));
    await gone();
    expect(onValueChange.mock.calls[0]?.[0]).toBe('Pizza');
    expect(document.querySelector('dialog[open]')).toBe(dialog);
  });
});
