// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode, type ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Popover, type PopoverContentProps, type PopoverRootProps } from '../index';
import { nextFrame, stubTopLayer } from './fixtures';

beforeEach(stubTopLayer);
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const popover = (): HTMLElement | null => screen.queryByRole('dialog');
const button = (name: string): HTMLElement => screen.getByRole('button', { name });

function Refusable({ root, ...handlers }: PopoverContentProps & { readonly root?: PopoverRootProps }): ReactElement {
  return (
    <StrictMode>
      <button>before</button>
      <Popover.Root {...root}>
        <Popover.Trigger>Share</Popover.Trigger>
        <Popover.Content aria-label="Share link" {...handlers}>
          <button>first</button>
          <input
            aria-label="Link"
            ref={(element) => {
              // React's `autoFocus` focuses on mount and writes no attribute; the cdk looks for the attribute.
              element?.setAttribute('autofocus', '');
            }}
          />
          <Popover.Close>Done</Popover.Close>
        </Popover.Content>
      </Popover.Root>
      <button>after</button>
    </StrictMode>
  );
}

describe('Popover Content handlers', () => {
  it('onEscapeKeyDown refuses with preventDefault; the key is the native event', async () => {
    const onEscapeKeyDown = vi.fn((event: KeyboardEvent) => {
      event.preventDefault();
    });
    const { rerender } = render(<Refusable onEscapeKeyDown={onEscapeKeyDown} />);
    await userEvent.click(button('Share'));
    await userEvent.keyboard('{Escape}');
    expect(onEscapeKeyDown).toHaveBeenCalledOnce();
    expect(onEscapeKeyDown.mock.calls[0]?.[0].key).toBe('Escape');
    expect(popover()).not.toBeNull();
    rerender(<Refusable />);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(popover()).toBeNull();
    });
  });

  it('runs onPointerDownOutside, then onInteractOutside with the same event; either refuses', async () => {
    const calls: string[] = [];
    const seen: Event[] = [];
    const { rerender } = render(
      <Refusable
        onPointerDownOutside={(event) => {
          calls.push('pointer');
          seen.push(event);
          event.preventDefault();
        }}
        onFocusOutside={(event) => {
          event.preventDefault();
        }}
        onInteractOutside={(event) => {
          calls.push('interact');
          seen.push(event);
        }}
      />,
    );
    await userEvent.click(button('Share'));
    await userEvent.click(button('after'));
    expect(calls.slice(0, 2)).toEqual(['pointer', 'interact']);
    expect(seen[0]).toBe(seen[1]);
    expect(popover()).not.toBeNull();

    rerender(
      <Refusable
        onInteractOutside={(event) => {
          event.preventDefault();
        }}
      />,
    );
    await userEvent.click(button('after'));
    expect(popover()).not.toBeNull();
  });

  it('runs onFocusOutside, then onInteractOutside; a refusal keeps the popover open', async () => {
    const calls: string[] = [];
    render(
      <Refusable
        onFocusOutside={(event) => {
          calls.push(`focus ${event.detail.originalEvent.type}`);
          event.preventDefault();
        }}
        onInteractOutside={() => {
          calls.push('interact');
        }}
      />,
    );
    await userEvent.click(button('Share'));
    button('after').focus();
    await waitFor(() => {
      expect(calls).toEqual(['focus focusin', 'interact']);
    });
    expect(popover()).not.toBeNull();
  });
});

describe('Popover details.cancel()', () => {
  it('keeps an uncontrolled popover as it was, for open and for every close', async () => {
    let refuse = true;
    const onOpenChange = vi.fn((_open: boolean, details: { cancel(): void }) => {
      if (refuse) details.cancel();
    });
    render(<Refusable root={{ onOpenChange }} />);
    await userEvent.click(button('Share'));
    expect(popover()).toBeNull();
    refuse = false;
    await userEvent.click(button('Share'));
    expect(popover()).not.toBeNull();

    refuse = true;
    await userEvent.keyboard('{Escape}');
    await userEvent.click(button('after'));
    await userEvent.click(button('Done'));
    expect(popover()).not.toBeNull();
    expect(onOpenChange.mock.calls.slice(2).every(([open]) => !open)).toBe(true);
    refuse = false;
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(popover()).toBeNull();
    });
  });
});

describe('Popover focus hooks', () => {
  it('focuses the autofocus element on open, unless onOpenAutoFocus prevents it', async () => {
    const { unmount } = render(<Refusable />);
    await userEvent.click(button('Share'));
    await nextFrame();
    expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Link' }));
    unmount();

    render(
      <Refusable
        onOpenAutoFocus={(event) => {
          event.preventDefault();
        }}
      />,
    );
    button('before').focus();
    // Open it from code, so the click does not move focus to the trigger.
    await userEvent.click(button('Share'));
    await nextFrame();
    expect(document.activeElement).not.toBe(screen.getByRole('textbox', { name: 'Link' }));
  });

  it('returns focus to the trigger on Escape, unless onCloseAutoFocus prevents it', async () => {
    const prevent = vi.fn((event: Event) => {
      event.preventDefault();
    });
    const { rerender } = render(<Refusable onCloseAutoFocus={prevent} />);
    await userEvent.click(button('Share'));
    await nextFrame();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(popover()).toBeNull();
    });
    await nextFrame();
    expect(prevent).toHaveBeenCalledOnce();
    expect(document.activeElement).not.toBe(button('Share'));

    rerender(<Refusable />);
    await userEvent.click(button('Share'));
    await nextFrame();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(document.activeElement).toBe(button('Share'));
    });
  });
});

describe('A Popover without a Trigger', () => {
  it('warns in development', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(
      <Popover.Root>
        <Popover.Content aria-label="Lonely">x</Popover.Content>
      </Popover.Root>,
    );
    await waitFor(() => {
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('CocoKits: <Popover.Content> has no trigger'));
    });
  });

  it('does not warn when a Trigger is there', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(<Refusable />);
    await nextFrame();
    await nextFrame();
    expect(warn).not.toHaveBeenCalled();
  });
});
