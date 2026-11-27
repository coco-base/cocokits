// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { OverlayPositionOptions } from '@cocokits/cdk/positioning';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Tooltip } from '../index';
import { Example, isOpen, reasons, stubTopLayer, tooltipContent, tooltipDescription, trigger } from './fixtures';

const starts: OverlayPositionOptions[] = [];
vi.mock('@cocokits/cdk/positioning', async (importOriginal) => {
  const original = await importOriginal<typeof import('@cocokits/cdk/positioning')>();
  return {
    ...original,
    startOverlayPosition: (options: OverlayPositionOptions) => {
      starts.push(options);
      return original.startOverlayPosition(options);
    },
  };
});

beforeEach(() => {
  stubTopLayer();
  starts.length = 0;
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('Tooltip closes when an ancestor of the trigger scrolls', () => {
  it('closes on a scrolling ancestor, with the reason scroll', async () => {
    const onOpenChange = vi.fn();
    render(
      <div data-testid="scroller">
        <Example defaultOpen onOpenChange={onOpenChange} />
      </div>,
    );
    await waitFor(() => {
      expect(isOpen()).toBe(true);
    });
    fireEvent.scroll(screen.getByTestId('scroller'));
    await waitFor(() => {
      expect(isOpen()).toBe(false);
    });
    expect(reasons(onOpenChange)).toEqual([[false, 'scroll']]);
  });

  it('closes on a scroll of the document', async () => {
    render(<Example defaultOpen />);
    await waitFor(() => {
      expect(isOpen()).toBe(true);
    });
    fireEvent.scroll(document);
    await waitFor(() => {
      expect(isOpen()).toBe(false);
    });
  });

  it('stays open when an unrelated element or the content scrolls', async () => {
    render(
      <>
        <div data-testid="other" />
        <Example defaultOpen />
      </>,
    );
    await waitFor(() => {
      expect(isOpen()).toBe(true);
    });
    fireEvent.scroll(screen.getByTestId('other'));
    const content = tooltipContent();
    if (content) fireEvent.scroll(content);
    expect(isOpen()).toBe(true);
  });

  it('stays open when onOpenChange cancels the scroll close', async () => {
    const onOpenChange = vi.fn((_open: boolean, details: unknown) => {
      (details as { cancel(): void }).cancel();
    });
    render(<Example defaultOpen onOpenChange={onOpenChange} />);
    await waitFor(() => {
      expect(isOpen()).toBe(true);
    });
    fireEvent.scroll(document);
    expect(onOpenChange).toHaveBeenCalled();
    expect(isOpen()).toBe(true);
  });

  it('listens only while shown', () => {
    const onOpenChange = vi.fn();
    render(<Example onOpenChange={onOpenChange} />);
    fireEvent.scroll(document);
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});

describe('Tooltip disabled', () => {
  it('shows closed at once, calls no onOpenChange and stays closed when enabled again (uncontrolled)', async () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(<Example defaultOpen onOpenChange={onOpenChange} />);
    await waitFor(() => {
      expect(isOpen()).toBe(true);
    });
    rerender(<Example defaultOpen onOpenChange={onOpenChange} disabled />);
    await waitFor(() => {
      expect(trigger().getAttribute('data-state')).toBe('closed');
    });
    await waitFor(() => {
      expect(isOpen()).toBe(false);
    });
    rerender(<Example defaultOpen onOpenChange={onOpenChange} />);
    await act(async () => {
      await Promise.resolve();
    });
    expect(isOpen()).toBe(false);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('keeps a controlled open the way the parent set it', async () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(<Example open onOpenChange={onOpenChange} />);
    await waitFor(() => {
      expect(isOpen()).toBe(true);
    });
    rerender(<Example open onOpenChange={onOpenChange} disabled />);
    await waitFor(() => {
      expect(isOpen()).toBe(false);
    });
    rerender(<Example open onOpenChange={onOpenChange} />);
    await waitFor(() => {
      expect(isOpen()).toBe(true);
    });
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});

describe('Tooltip.Content positioning props', () => {
  it('passes the six props to startOverlayPosition', async () => {
    render(
      <Tooltip.Root defaultOpen>
        <Tooltip.Trigger>Copy</Tooltip.Trigger>
        <Tooltip.Content
          sideOffset={12}
          alignOffset={3}
          avoidCollisions={false}
          collisionPadding={{ top: 8 }}
          sticky="always"
          hideWhenDetached
        >
          Copy the link
        </Tooltip.Content>
      </Tooltip.Root>,
    );
    await waitFor(() => {
      expect(starts.length).toBeGreaterThan(0);
    });
    expect(starts.at(-1)).toMatchObject({
      sideOffset: 12,
      alignOffset: 3,
      avoidCollisions: false,
      collisionPadding: { top: 8 },
      sticky: 'always',
      hideWhenDetached: true,
    });
  });

  it('passes none of them when unset, so the positioning defaults apply', async () => {
    render(
      <Tooltip.Root defaultOpen>
        <Tooltip.Trigger>Copy</Tooltip.Trigger>
        <Tooltip.Content>Copy the link</Tooltip.Content>
      </Tooltip.Root>,
    );
    await waitFor(() => {
      expect(starts.length).toBeGreaterThan(0);
    });
    expect(Object.keys(starts.at(-1) ?? {}).sort()).toEqual([
      'align',
      'getAnchor',
      'getContent',
      'getDirection',
      'onPlacementChange',
      'side',
    ]);
  });

  it('hides the content while the anchor is hidden', async () => {
    render(
      <Tooltip.Root defaultOpen>
        <Tooltip.Trigger>Copy</Tooltip.Trigger>
        <Tooltip.Content hideWhenDetached>Copy the link</Tooltip.Content>
      </Tooltip.Root>,
    );
    await waitFor(() => {
      expect(starts.length).toBeGreaterThan(0);
    });
    const start = starts.at(-1);
    act(() => {
      start?.onAnchorHiddenChange?.(true);
    });
    expect(tooltipContent()?.hasAttribute('hidden')).toBe(true);
    // The hidden description is not the content.
    expect(tooltipDescription()?.hasAttribute('hidden')).toBe(true);
  });
});
