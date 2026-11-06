// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode, useState, type ReactElement } from 'react';
import { DirectionProvider } from '@cocokits/react-core';
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { Tooltip } from '../../tooltip';
import { Popover } from '../index';
import { popover, stubTopLayer } from './fixtures';

beforeEach(stubTopLayer);
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
  document.documentElement.removeAttribute('dir');
});

type OpenChange = (open: boolean, details: { reason: string; event: Event | null }) => void;

const reasons = (fn: Mock<OpenChange>): unknown[] => fn.mock.calls.map((call) => [call[0], call[1].reason]);

/** A Tooltip, open, on a button inside an open Popover. */
function Stack({
  onPopover,
  onTooltip,
}: {
  readonly onPopover: Mock<OpenChange>;
  readonly onTooltip: Mock<OpenChange>;
}): ReactElement {
  return (
    <StrictMode>
      <button>after</button>
      <Popover.Root defaultOpen onOpenChange={onPopover}>
        <Popover.Trigger>Share</Popover.Trigger>
        <Popover.Content aria-label="Share link">
          <p>Anyone with the link can view.</p>
          <Tooltip.Root defaultOpen onOpenChange={onTooltip}>
            <Tooltip.Trigger>Copy</Tooltip.Trigger>
            <Tooltip.Content>Copy the link</Tooltip.Content>
          </Tooltip.Root>
        </Popover.Content>
      </Popover.Root>
    </StrictMode>
  );
}

const tooltip = (): HTMLElement | null => document.querySelector<HTMLElement>('.cck-tooltip__content');

describe('Tooltip over a Popover', () => {
  it('closes both on a press outside, the tooltip first', async () => {
    const onPopover = vi.fn<OpenChange>();
    const onTooltip = vi.fn<OpenChange>();
    render(<Stack onPopover={onPopover} onTooltip={onTooltip} />);
    await waitFor(() => {
      expect(tooltip()).not.toBeNull();
    });
    await userEvent.click(screen.getByRole('button', { name: 'after' }));
    await waitFor(() => {
      expect(popover()).toBeNull();
    });
    expect(tooltip()).toBeNull();
    expect(reasons(onTooltip)).toEqual([[false, 'outside-press']]);
    expect(reasons(onPopover)).toEqual([[false, 'outside-press']]);
    expect(onTooltip.mock.invocationCallOrder[0]).toBeLessThan(onPopover.mock.invocationCallOrder[0] ?? 0);
  });

  it('closes only the tooltip on a press inside the popover', async () => {
    const onPopover = vi.fn<OpenChange>();
    const onTooltip = vi.fn<OpenChange>();
    render(<Stack onPopover={onPopover} onTooltip={onTooltip} />);
    await waitFor(() => {
      expect(tooltip()).not.toBeNull();
    });
    await userEvent.click(screen.getByText('Anyone with the link can view.'));
    await waitFor(() => {
      expect(tooltip()).toBeNull();
    });
    expect(popover()).not.toBeNull();
    expect(reasons(onTooltip)).toEqual([[false, 'outside-press']]);
    expect(onPopover).not.toHaveBeenCalled();
  });
});

describe('Popover direction', () => {
  it('follows a dir change on the page while open', async () => {
    function Page(): ReactElement {
      const [dir, setDir] = useState<'ltr' | 'rtl'>('ltr');
      return (
        <DirectionProvider dir={dir}>
          <Popover.Root defaultOpen>
            <Popover.Trigger>Share</Popover.Trigger>
            <Popover.Content aria-label="Share link" side="start">
              <button
                onClick={() => {
                  document.documentElement.setAttribute('dir', 'rtl');
                  setDir('rtl');
                }}
              >
                flip
              </button>
            </Popover.Content>
          </Popover.Root>
        </DirectionProvider>
      );
    }
    render(<Page />);
    await waitFor(() => {
      expect(popover()).not.toBeNull();
    });
    const host = document.querySelector('[popover]');
    expect(host?.getAttribute('dir')).toBe('ltr');
    await userEvent.click(screen.getByRole('button', { name: 'flip' }));
    await waitFor(() => {
      expect(host?.getAttribute('dir')).toBe('rtl');
    });
    expect(popover()?.getAttribute('data-side')).toBe('start');
  });
});

describe('Popover initial focus', () => {
  it('prefers a later [autofocus] element over the first tabbable', async () => {
    render(
      <Popover.Root>
        <Popover.Trigger>Share</Popover.Trigger>
        <Popover.Content aria-label="Share link">
          <button>first</button>
          <button
            ref={(element) => {
              element?.setAttribute('autofocus', '');
            }}
          >
            second
          </button>
        </Popover.Content>
      </Popover.Root>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Share' }));
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'second' }));
    });
  });
});
