// @vitest-environment jsdom
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type MenuChangeDetails, type MenuContentProps } from '../index';
import { Example, expectFocus, item, menu, stubTopLayer, trigger } from './fixtures';

beforeEach(stubTopLayer);
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

type Handler = (event: Event) => void;
const prevent: Handler = (event) => {
  event.preventDefault();
};

const gone = (): Promise<void> =>
  waitFor(() => {
    expect(menu()).toBeNull();
  });

const settle = (): Promise<unknown> => new Promise((resolve) => setTimeout(resolve, 30));

/** The way a user closes the menu, by the reason it reports. */
const closers = {
  escape: () => userEvent.keyboard('{Escape}'),
  'outside-press': () => userEvent.click(document.body),
  'focus-out': () => {
    act(() => {
      screen.getByRole('button', { name: 'after' }).focus();
    });
    return Promise.resolve();
  },
} as const;

async function openMenu(content: MenuContentProps, onOpenChange = vi.fn()): Promise<typeof onOpenChange> {
  render(<Example root={{ onOpenChange }} content={content} />);
  await userEvent.click(trigger());
  await expectFocus(item('Edit'));
  onOpenChange.mockClear();
  return onOpenChange;
}

describe('Menu Content handlers refuse a close with preventDefault', () => {
  it.each([
    ['onEscapeKeyDown', 'escape'],
    ['onPointerDownOutside', 'outside-press'],
    ['onInteractOutside', 'outside-press'],
    ['onFocusOutside', 'focus-out'],
    ['onInteractOutside', 'focus-out'],
  ] as const)('%s keeps the menu open on %s and fires no change', async (handler, reason) => {
    const onHandler = vi.fn(prevent);
    const onOpenChange = await openMenu({ [handler]: onHandler });
    await closers[reason]();
    await settle();
    expect(onHandler).toHaveBeenCalledOnce();
    expect(menu()).not.toBeNull();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('closes again when the handlers do not refuse', async () => {
    const onOpenChange = await openMenu({ onEscapeKeyDown: vi.fn(), onInteractOutside: vi.fn() });
    await closers.escape();
    await gone();
    expect(onOpenChange).toHaveBeenCalledWith(false, expect.objectContaining({ reason: 'escape' }));
  });

  it('gives onEscapeKeyDown the native key event', async () => {
    const onEscapeKeyDown = vi.fn(prevent);
    await openMenu({ onEscapeKeyDown });
    await closers.escape();
    expect((onEscapeKeyDown.mock.calls[0]?.[0] as KeyboardEvent).key).toBe('Escape');
  });

  it('gives the pointer handler the press in detail.originalEvent', async () => {
    const seen: unknown[] = [];
    await openMenu({
      onPointerDownOutside: (event) => {
        seen.push(event.detail.originalEvent.type);
        event.preventDefault();
      },
    });
    await closers['outside-press']();
    expect(seen).toEqual(['pointerdown']);
  });
});

describe('Menu details.cancel() refuses a close', () => {
  it.each(Object.keys(closers) as (keyof typeof closers)[])('keeps the menu open on %s', async (reason) => {
    const onOpenChange = vi.fn((open: boolean, details: MenuChangeDetails) => {
      if (!open) details.cancel();
    });
    render(<Example root={{ onOpenChange }} />);
    await userEvent.click(trigger());
    await expectFocus(item('Edit'));
    onOpenChange.mockClear();
    await closers[reason]();
    await settle();
    expect(onOpenChange).toHaveBeenCalledOnce();
    expect(onOpenChange.mock.calls[0]?.[1].reason).toBe(reason);
    expect(menu()).not.toBeNull();
  });

  it('keeps the menu open when an item runs, and refuses the open itself', async () => {
    const onOpenChange = vi.fn((open: boolean, details: MenuChangeDetails) => {
      if (!open || details.reason === 'trigger') details.cancel();
    });
    render(<Example root={{ defaultOpen: true, onOpenChange }} />);
    await waitFor(() => {
      expect(menu()).not.toBeNull();
    });
    await userEvent.click(item('Edit'));
    await settle();
    expect(menu()).not.toBeNull();
    expect(onOpenChange.mock.calls.at(-1)?.[1].reason).toBe('item');
  });

  it('does not open when cancel() refuses the open', async () => {
    const onOpenChange = vi.fn((_open: boolean, details: MenuChangeDetails) => {
      details.cancel();
    });
    render(<Example root={{ onOpenChange }} />);
    await userEvent.click(trigger());
    expect(menu()).toBeNull();
  });
});

describe('Menu closes that no handler refuses', () => {
  it('a click on the trigger closes the menu although every handler refuses', async () => {
    const handlers = {
      onEscapeKeyDown: prevent,
      onPointerDownOutside: prevent,
      onFocusOutside: prevent,
      onInteractOutside: prevent,
    };
    render(<Example content={handlers} />);
    await userEvent.click(trigger());
    await userEvent.click(trigger());
    await gone();
  });

  it('a parent write closes the menu although every handler refuses', async () => {
    const handlers = { onEscapeKeyDown: prevent, onPointerDownOutside: prevent, onInteractOutside: prevent };
    const onOpenChange = vi.fn();
    const { rerender } = render(<Example root={{ open: true, onOpenChange }} content={handlers} />);
    await waitFor(() => {
      expect(menu()).not.toBeNull();
    });
    rerender(<Example root={{ open: false, onOpenChange }} content={handlers} />);
    await gone();
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
