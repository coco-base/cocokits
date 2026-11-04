// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState, type ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { OverlayPositionOptions, OverlayVirtualAnchor } from '@cocokits/cdk/positioning';
import { Popover } from '../index';
import { stubTopLayer } from './fixtures';

const { starts } = vi.hoisted(() => ({ starts: [] as Record<string, unknown>[] }));

vi.mock('@cocokits/cdk/positioning', async (importOriginal) => {
  const original = await importOriginal<typeof import('@cocokits/cdk/positioning')>();
  return {
    ...original,
    startOverlayPosition: (options: OverlayPositionOptions) => {
      starts.push({ ...options, anchor: options.getAnchor() });
      return vi.fn();
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

const last = (): Record<string, unknown> => {
  const start = starts.at(-1);
  if (start === undefined) throw new Error('positioning was not started');
  return start;
};
const trigger = (): HTMLElement => screen.getByRole('button', { name: 'Share' });

describe('Popover.Anchor', () => {
  it('places the content against the anchor, and against the trigger without one', async () => {
    const { unmount } = render(
      <Popover.Root defaultOpen>
        <Popover.Trigger>Share</Popover.Trigger>
        <Popover.Content aria-label="x">text</Popover.Content>
      </Popover.Root>,
    );
    await waitFor(() => {
      expect(starts.length).toBeGreaterThan(0);
    });
    expect(last().anchor).toBe(trigger());
    unmount();
    starts.length = 0;

    render(
      <Popover.Root defaultOpen>
        <Popover.Anchor data-testid="anchor">
          <Popover.Trigger>Share</Popover.Trigger>
        </Popover.Anchor>
        <Popover.Content aria-label="x">text</Popover.Content>
      </Popover.Root>,
    );
    await waitFor(() => {
      expect(starts.length).toBeGreaterThan(0);
    });
    expect(last().anchor).toBe(screen.getByTestId('anchor'));
    expect(screen.getByTestId('anchor').className).toBe('cck-popover__anchor');
    expect(screen.getByTestId('anchor').hasAttribute('role')).toBe(false);
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
  });

  it('places the content against the trigger again when the anchor unmounts while open', async () => {
    function Example(): ReactElement {
      const [shown, setShown] = useState(true);
      return (
        <Popover.Root defaultOpen>
          <button
            onClick={() => {
              setShown(false);
            }}
          >
            remove
          </button>
          {shown ? <Popover.Anchor data-testid="anchor" /> : null}
          <Popover.Trigger>Share</Popover.Trigger>
          <Popover.Content aria-label="x">text</Popover.Content>
        </Popover.Root>
      );
    }
    render(<Example />);
    await waitFor(() => {
      expect(last().anchor).toBe(screen.getByTestId('anchor'));
    });
    fireEvent.click(screen.getByText('remove'));
    await waitFor(() => {
      expect(last().anchor).toBe(trigger());
    });
  });

  it('keeps the last anchor mounted', async () => {
    render(
      <Popover.Root defaultOpen>
        <Popover.Anchor data-testid="first" />
        <Popover.Anchor data-testid="second" />
        <Popover.Trigger>Share</Popover.Trigger>
        <Popover.Content aria-label="x">text</Popover.Content>
      </Popover.Root>,
    );
    await waitFor(() => {
      expect(last().anchor).toBe(screen.getByTestId('second'));
    });
  });

  it('closes on a press on the anchor outside the trigger, and focus returns to the trigger', async () => {
    render(
      <Popover.Root>
        <Popover.Anchor data-testid="anchor">row</Popover.Anchor>
        <Popover.Trigger>Share</Popover.Trigger>
        <Popover.Content aria-label="x">
          <button>inside</button>
        </Popover.Content>
      </Popover.Root>,
    );
    await userEvent.click(trigger());
    expect(screen.getByRole('dialog')).toBeTruthy();
    await userEvent.click(screen.getByTestId('anchor'));
    await waitFor(() => {
      expect(trigger().getAttribute('aria-expanded')).toBe('false');
    });
    await waitFor(() => {
      expect(document.activeElement).toBe(trigger());
    });
  });

  it('with virtualRef renders nothing and places the content against the virtual element', async () => {
    const virtual: OverlayVirtualAnchor = {
      getBoundingClientRect: () => ({ x: 1, y: 2, width: 3, height: 4, top: 2, right: 4, bottom: 6, left: 1 }),
    };
    const virtualRef = createRef<OverlayVirtualAnchor | null>() as { current: OverlayVirtualAnchor | null };
    virtualRef.current = virtual;
    const { container } = render(
      <Popover.Root defaultOpen>
        <Popover.Anchor virtualRef={virtualRef} />
        <Popover.Trigger>Share</Popover.Trigger>
        <Popover.Content aria-label="x">text</Popover.Content>
      </Popover.Root>,
    );
    await waitFor(() => {
      expect(last().anchor).toBe(virtual);
    });
    expect(container.querySelector('.cck-popover__anchor')).toBeNull();
  });

  it('with an empty virtualRef never uses the trigger as the anchor', async () => {
    const virtualRef = { current: null as OverlayVirtualAnchor | null };
    render(
      <Popover.Root defaultOpen>
        <Popover.Anchor virtualRef={virtualRef} />
        <Popover.Trigger>Share</Popover.Trigger>
        <Popover.Content aria-label="x">text</Popover.Content>
      </Popover.Root>,
    );
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeTruthy();
    });
    expect(starts.length).toBeGreaterThan(0);
    expect(starts.every((start) => start.anchor === null)).toBe(true);
  });
});

describe('Popover.Content positioning props', () => {
  it('passes nothing when they are unset, so the positioning defaults apply', async () => {
    render(
      <Popover.Root defaultOpen>
        <Popover.Trigger>Share</Popover.Trigger>
        <Popover.Content aria-label="x">text</Popover.Content>
      </Popover.Root>,
    );
    await waitFor(() => {
      expect(starts.length).toBeGreaterThan(0);
    });
    const names = Object.keys(last()).sort();
    expect(names).toEqual(['align', 'anchor', 'getAnchor', 'getContent', 'getDirection', 'onPlacementChange', 'side']);
  });

  it('passes the six props to startOverlayPosition', async () => {
    render(
      <Popover.Root defaultOpen>
        <Popover.Trigger>Share</Popover.Trigger>
        <Popover.Content
          aria-label="x"
          sideOffset={12}
          alignOffset={3}
          avoidCollisions={false}
          collisionPadding={{ top: 8 }}
          sticky="always"
          hideWhenDetached
        >
          text
        </Popover.Content>
      </Popover.Root>,
    );
    await waitFor(() => {
      expect(starts.length).toBeGreaterThan(0);
    });
    expect(last()).toMatchObject({
      sideOffset: 12,
      alignOffset: 3,
      avoidCollisions: false,
      collisionPadding: { top: 8 },
      sticky: 'always',
      hideWhenDetached: true,
    });
  });

  it('does not restart the positioning when an inline padding object has the same values', async () => {
    function Example(): ReactElement {
      const [count, setCount] = useState(0);
      return (
        <Popover.Root defaultOpen>
          <Popover.Trigger onClick={() => undefined}>Share</Popover.Trigger>
          <Popover.Content aria-label="x" collisionPadding={{ top: 8 }}>
            <button
              onClick={() => {
                setCount(count + 1);
              }}
            >
              rerender {count}
            </button>
          </Popover.Content>
        </Popover.Root>
      );
    }
    render(<Example />);
    await waitFor(() => {
      expect(starts.length).toBeGreaterThan(0);
    });
    const started = starts.length;
    await userEvent.click(screen.getByText('rerender 0'));
    await screen.findByText('rerender 1');
    expect(starts.length).toBe(started);
  });

  it('renders hidden while the anchor is hidden and shows again when it is visible', async () => {
    render(
      <Popover.Root defaultOpen>
        <Popover.Trigger>Share</Popover.Trigger>
        <Popover.Content aria-label="x" hideWhenDetached>
          text
        </Popover.Content>
      </Popover.Root>,
    );
    await waitFor(() => {
      expect(starts.length).toBeGreaterThan(0);
    });
    const report = last().onAnchorHiddenChange as (hidden: boolean) => void;
    expect(screen.getByRole('dialog').hasAttribute('hidden')).toBe(false);
    act(() => {
      report(true);
    });
    expect(screen.getByRole('dialog', { hidden: true }).hasAttribute('hidden')).toBe(true);
    act(() => {
      report(false);
    });
    expect(screen.getByRole('dialog').hasAttribute('hidden')).toBe(false);
  });

  it('does not report a hidden anchor without hideWhenDetached', async () => {
    render(
      <Popover.Root defaultOpen>
        <Popover.Trigger>Share</Popover.Trigger>
        <Popover.Content aria-label="x">text</Popover.Content>
      </Popover.Root>,
    );
    await waitFor(() => {
      expect(starts.length).toBeGreaterThan(0);
    });
    expect(last().onAnchorHiddenChange).toBeUndefined();
  });
});
