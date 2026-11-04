// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode, type ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Tooltip, type TooltipContentProps, type TooltipRootProps } from '../index';
import { stubTopLayer, tooltipContent } from './fixtures';

const nextFrame = (): Promise<void> =>
  new Promise((resolve) => {
    requestAnimationFrame(() => {
      resolve();
    });
  });

beforeEach(stubTopLayer);
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const tooltip = tooltipContent;

function Refusable({ root, ...handlers }: TooltipContentProps & { readonly root?: TooltipRootProps }): ReactElement {
  return (
    <StrictMode>
      <Tooltip.Root defaultOpen {...root}>
        <Tooltip.Trigger aria-label="Copy link">Copy</Tooltip.Trigger>
        <Tooltip.Content {...handlers}>Copy the link</Tooltip.Content>
      </Tooltip.Root>
      <p>Empty space</p>
    </StrictMode>
  );
}

describe('Tooltip Content handlers', () => {
  it('onEscapeKeyDown refuses with preventDefault; otherwise Escape closes', async () => {
    const onEscapeKeyDown = vi.fn((event: KeyboardEvent) => {
      event.preventDefault();
    });
    const { rerender } = render(<Refusable onEscapeKeyDown={onEscapeKeyDown} />);
    await waitFor(() => {
      expect(tooltip()).not.toBeNull();
    });
    await userEvent.keyboard('{Escape}');
    expect(onEscapeKeyDown).toHaveBeenCalledOnce();
    expect(tooltip()).not.toBeNull();
    rerender(<Refusable />);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(tooltip()).toBeNull();
    });
  });

  it('closes on an outside press with the reason outside-press, and onPointerDownOutside refuses it', async () => {
    const onOpenChange = vi.fn();
    const refuse = vi.fn((event: Event) => {
      event.preventDefault();
    });
    const { rerender } = render(<Refusable root={{ onOpenChange }} onPointerDownOutside={refuse} />);
    await waitFor(() => {
      expect(tooltip()).not.toBeNull();
    });
    await userEvent.click(screen.getByText('Empty space'));
    expect(refuse).toHaveBeenCalledOnce();
    expect(tooltip()).not.toBeNull();
    expect(onOpenChange).not.toHaveBeenCalled();

    rerender(<Refusable root={{ onOpenChange }} />);
    await userEvent.click(screen.getByText('Empty space'));
    await waitFor(() => {
      expect(tooltip()).toBeNull();
    });
    expect(onOpenChange).toHaveBeenCalledWith(false, expect.objectContaining({ reason: 'outside-press' }));
  });
});

describe('Tooltip details.cancel()', () => {
  it('keeps an uncontrolled tooltip open when the close is canceled', async () => {
    const onOpenChange = vi.fn((_open: boolean, details: { cancel(): void }) => {
      details.cancel();
    });
    render(<Refusable root={{ onOpenChange }} />);
    await waitFor(() => {
      expect(tooltip()).not.toBeNull();
    });
    await userEvent.keyboard('{Escape}');
    await nextFrame();
    expect(onOpenChange).toHaveBeenCalledWith(false, expect.objectContaining({ reason: 'escape', isCanceled: true }));
    expect(tooltip()).not.toBeNull();
  });

  it('keeps a closed tooltip closed when the open is canceled', async () => {
    const onOpenChange = vi.fn((_open: boolean, details: { cancel(): void }) => {
      details.cancel();
    });
    render(<Refusable root={{ defaultOpen: false, delayDuration: 0, onOpenChange }} />);
    await userEvent.tab();
    expect(onOpenChange).toHaveBeenCalledWith(true, expect.objectContaining({ isCanceled: true }));
    expect(tooltip()).toBeNull();
  });
});

describe('A Tooltip without a Trigger', () => {
  it('warns in development', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(
      <Tooltip.Root>
        <Tooltip.Content>x</Tooltip.Content>
      </Tooltip.Root>,
    );
    await waitFor(() => {
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('CocoKits: <Tooltip.Content> has no trigger'));
    });
  });
});
