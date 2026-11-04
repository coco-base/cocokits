// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, StrictMode, type ReactElement } from 'react';
import { Popover } from '../../popover';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Tooltip } from '../index';
import { Example, stubTopLayer, tooltipContent, tooltipDescription } from './fixtures';

beforeEach(() => {
  stubTopLayer();
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'requestAnimationFrame', 'cancelAnimationFrame'] });
  // Testing Library waits with a real timer unless it finds fake ones through a `jest` global; vitest's fake
  // clock is the same one, so this lets `waitFor` and user-event advance it instead of hanging.
  Reflect.set(globalThis, 'jest', { advanceTimersByTime: (ms: number) => vi.advanceTimersByTime(ms) });
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  Reflect.deleteProperty(globalThis, 'jest');
  Reflect.deleteProperty(HTMLElement.prototype, 'getAnimations');
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const setup = (): ReturnType<typeof userEvent.setup> =>
  userEvent.setup({ delay: null, advanceTimers: (ms) => vi.advanceTimersByTime(ms) });
const elapse = (ms: number): void => {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
};
const trigger = (): HTMLElement => screen.getByRole('button', { name: 'Copy link' });
const content = tooltipContent;
const shown = (): HTMLElement => {
  const element = content();
  if (!element) throw new Error('Expected the tooltip to be open.');
  return element;
};
const isOpen = (): boolean => content() !== null;
const reasons = (fn: ReturnType<typeof vi.fn>): unknown[] =>
  fn.mock.calls.map((call: unknown[]) => [call[0], (call[1] as { reason: string }).reason]);

describe('Tooltip rendered contract', () => {
  it('renders only the trigger while closed', () => {
    render(<Example />);
    expect(trigger().tagName).toBe('BUTTON');
    expect(trigger().className).toBe('cck-tooltip__trigger');
    expect(trigger().getAttribute('type')).toBe('button');
    expect(trigger().getAttribute('data-state')).toBe('closed');
    expect(isOpen()).toBe(false);
    expect(document.querySelector('[popover]')).toBeNull();
  });

  it('renders the content in a top-layer host outside the trigger parent, linked by ids', async () => {
    const user = setup();
    const { container } = render(<Example />);
    await user.tab();
    await user.tab();
    const tip = content();
    expect(tip).not.toBeNull();
    expect(tip?.tagName).toBe('DIV');
    expect(tip?.className).toBe('cck-tooltip__content');
    expect(tip?.getAttribute('data-state')).toBe('open');
    expect(tip?.getAttribute('data-side')).toBe('top');
    expect(tip?.getAttribute('data-align')).toBe('center');
    expect(tip?.hasAttribute('tabindex')).toBe(false);
    expect(container.contains(tip)).toBe(false);
    expect(tip?.parentElement?.getAttribute('popover')).toBe('manual');
    expect(tip?.getAttribute('aria-hidden')).toBe('true');
    expect(trigger().getAttribute('aria-describedby')).toBe(tooltipDescription()?.id);
    expect(trigger().getAttribute('data-state')).toBe('open');
  });

  it('writes the resolved side and positions with position fixed', async () => {
    render(<Example defaultOpen side="bottom" />);
    await waitFor(() => {
      expect(content()?.style.position).toBe('fixed');
    });
    expect(content()?.getAttribute('data-side')).toBe('bottom');
  });

  it('adds its id to the description the author wrote', async () => {
    render(
      <Tooltip.Root defaultOpen>
        <Tooltip.Trigger aria-label="Copy" aria-describedby="mine">
          x
        </Tooltip.Trigger>
        <Tooltip.Content>Tip</Tooltip.Content>
      </Tooltip.Root>,
    );
    await waitFor(() => {
      expect(content()).not.toBeNull();
    });
    expect(screen.getByRole('button', { name: 'Copy' }).getAttribute('aria-describedby')).toBe(
      `mine ${tooltipDescription()?.id ?? ''}`,
    );
  });

  it('routes ref, className and a render element to the parts and keeps the fixed class', async () => {
    const triggerRef = createRef<HTMLButtonElement>();
    const contentRef = createRef<HTMLDivElement>();
    render(
      <Tooltip.Root defaultOpen>
        <Tooltip.Trigger ref={triggerRef} className="mine" nativeButton={false} render={<a href="#x" data-mine="" />}>
          Link
        </Tooltip.Trigger>
        <Tooltip.Content ref={contentRef} className="mine" render={(props) => <section {...props} />}>
          Tip
        </Tooltip.Content>
      </Tooltip.Root>,
    );
    await waitFor(() => {
      expect(contentRef.current).not.toBeNull();
    });
    const link = screen.getByRole('link', { name: 'Link' });
    expect(triggerRef.current).toBe(link);
    expect(link.className).toBe('cck-tooltip__trigger mine');
    expect(link.hasAttribute('type')).toBe(false);
    expect(link.hasAttribute('data-mine')).toBe(true);
    expect(contentRef.current?.tagName).toBe('SECTION');
    expect(contentRef.current?.className).toBe('cck-tooltip__content mine');
    expect(link.getAttribute('aria-describedby')).toBe(tooltipDescription()?.id);
  });

  it('throws a clear error for a part outside the root', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<Tooltip.Trigger>Orphan</Tooltip.Trigger>)).toThrow(
      /<Tooltip.Trigger> must be placed within <Tooltip.Root>/,
    );
  });
});

describe('Tooltip hover', () => {
  it('opens after the delay on a mouse hover and reports the reason', async () => {
    const user = setup();
    const onOpenChange = vi.fn();
    render(<Example onOpenChange={onOpenChange} />);
    await user.hover(trigger());
    elapse(699);
    expect(isOpen()).toBe(false);
    elapse(1);
    await waitFor(() => {
      expect(isOpen()).toBe(true);
    });
    expect(reasons(onOpenChange)).toEqual([[true, 'hover']]);
  });

  it('does not open when the pointer leaves before the delay', async () => {
    const user = setup();
    const onOpenChange = vi.fn();
    render(<Example onOpenChange={onOpenChange} />);
    await user.hover(trigger());
    elapse(300);
    await user.unhover(trigger());
    elapse(1000);
    expect(isOpen()).toBe(false);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('uses the delay prop', async () => {
    const user = setup();
    render(<Example delayDuration={100} />);
    await user.hover(trigger());
    elapse(100);
    await waitFor(() => {
      expect(isOpen()).toBe(true);
    });
  });

  it('closes after the pointer leaves, with the reason pointer-leave', async () => {
    const user = setup();
    const onOpenChange = vi.fn();
    render(<Example onOpenChange={onOpenChange} />);
    await user.hover(trigger());
    elapse(700);
    await waitFor(() => {
      expect(isOpen()).toBe(true);
    });
    await user.unhover(trigger());
    elapse(100);
    await waitFor(() => {
      expect(isOpen()).toBe(false);
    });
    expect(reasons(onOpenChange)).toEqual([
      [true, 'hover'],
      [false, 'pointer-leave'],
    ]);
  });

  it('closes at once when the pointer leaves with disableHoverableContent', async () => {
    const user = setup();
    render(<Example disableHoverableContent />);
    await user.hover(trigger());
    elapse(700);
    await waitFor(() => {
      expect(isOpen()).toBe(true);
    });
    await user.unhover(trigger());
    await waitFor(() => {
      expect(isOpen()).toBe(false);
    });
  });

  it('stays open while the pointer crosses to the content (hoverable) and closes after leaving it', async () => {
    const user = setup();
    render(<Example />);
    await user.hover(trigger());
    elapse(700);
    await waitFor(() => {
      expect(isOpen()).toBe(true);
    });
    await user.unhover(trigger());
    elapse(50);
    await user.hover(shown());
    elapse(2000);
    expect(isOpen()).toBe(true);
    await user.unhover(shown());
    elapse(100);
    await waitFor(() => {
      expect(isOpen()).toBe(false);
    });
  });
});

describe('Tooltip focus and keyboard', () => {
  it('opens at once on keyboard focus and closes on blur', async () => {
    const user = setup();
    const onOpenChange = vi.fn();
    render(<Example onOpenChange={onOpenChange} />);
    await user.tab();
    await user.tab();
    await waitFor(() => {
      expect(isOpen()).toBe(true);
    });
    await user.tab();
    await waitFor(() => {
      expect(isOpen()).toBe(false);
    });
    expect(reasons(onOpenChange)).toEqual([
      [true, 'focus'],
      [false, 'blur'],
    ]);
  });

  it('closes on Escape and keeps focus on the trigger', async () => {
    const user = setup();
    const onOpenChange = vi.fn();
    render(<Example onOpenChange={onOpenChange} />);
    await user.tab();
    await user.tab();
    await waitFor(() => {
      expect(isOpen()).toBe(true);
    });
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(isOpen()).toBe(false);
    });
    expect(document.activeElement).toBe(trigger());
    expect(reasons(onOpenChange).at(-1)).toEqual([false, 'escape']);
  });

  it('does not open on a mouse click: the press cancels the pending hover', async () => {
    const user = setup();
    const onOpenChange = vi.fn();
    render(<Example onOpenChange={onOpenChange} />);
    await user.click(trigger());
    elapse(2000);
    expect(isOpen()).toBe(false);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('closes on a press on the trigger with the reason press', async () => {
    const user = setup();
    const onOpenChange = vi.fn();
    render(<Example onOpenChange={onOpenChange} />);
    await user.hover(trigger());
    elapse(700);
    await waitFor(() => {
      expect(isOpen()).toBe(true);
    });
    await user.pointer({ keys: '[MouseLeft>]', target: trigger() });
    await waitFor(() => {
      expect(isOpen()).toBe(false);
    });
    expect(reasons(onOpenChange)).toEqual([
      [true, 'hover'],
      [false, 'press'],
    ]);
  });
});

describe('Tooltip touch', () => {
  it('never opens on a touch hover or a tap', async () => {
    const user = setup();
    const onOpenChange = vi.fn();
    render(<Example onOpenChange={onOpenChange} />);
    const touch = (type: string): void => {
      const event = new Event(type, { bubbles: true });
      Object.defineProperty(event, 'pointerType', { value: 'touch' });
      fireEvent(trigger(), event);
    };
    touch('pointerover');
    touch('pointerdown');
    await user.pointer({ keys: '[TouchA]', target: trigger() });
    elapse(2000);
    expect(isOpen()).toBe(false);
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});

describe('Tooltip open state', () => {
  it('is controlled: a request is reported, and the parent decides', async () => {
    const user = setup();
    const onOpenChange = vi.fn();
    render(<Example open={false} onOpenChange={onOpenChange} />);
    await user.tab();
    await user.tab();
    expect(reasons(onOpenChange)).toEqual([[true, 'focus']]);
    expect(isOpen()).toBe(false);
  });

  it('follows the open prop without reporting', async () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(<Example open={false} onOpenChange={onOpenChange} />);
    rerender(<Example open onOpenChange={onOpenChange} />);
    await waitFor(() => {
      expect(isOpen()).toBe(true);
    });
    rerender(<Example open={false} onOpenChange={onOpenChange} />);
    await waitFor(() => {
      expect(isOpen()).toBe(false);
    });
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('never opens while disabled, and closes when it becomes disabled', async () => {
    const user = setup();
    const { rerender } = render(<Example disabled />);
    await user.hover(trigger());
    elapse(2000);
    await user.tab();
    await user.tab();
    expect(isOpen()).toBe(false);
    expect(trigger().getAttribute('data-state')).toBe('closed');
    rerender(<Example open />);
    await waitFor(() => {
      expect(isOpen()).toBe(true);
    });
    rerender(<Example open disabled />);
    await waitFor(() => {
      expect(isOpen()).toBe(false);
    });
  });

  it('unmounts after the exit animation of the content has finished', async () => {
    const user = setup();
    render(<Example />);
    await user.tab();
    await user.tab();
    await waitFor(() => {
      expect(isOpen()).toBe(true);
    });
    const tip = shown();
    let finish: () => void = () => undefined;
    const finished = new Promise<void>((resolve) => {
      finish = resolve;
    });
    tip.getAnimations = () => [
      {
        finished,
        animationName: 'exit',
        playState: 'running',
        effect: { getComputedTiming: () => ({ endTime: 300 }) },
      } as unknown as Animation,
    ];
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(content()?.getAttribute('data-state')).toBe('closed');
    });
    expect(trigger().getAttribute('aria-describedby')).toBe(tooltipDescription()?.id);
    await act(async () => {
      finish();
      await finished;
    });
    await waitFor(() => {
      expect(isOpen()).toBe(false);
    });
    expect(trigger().getAttribute('aria-describedby')).toBe(tooltipDescription()?.id);
  });

  it('clears its timer and layer when it unmounts while pending or open', async () => {
    const user = setup();
    const onOpenChange = vi.fn();
    const { unmount } = render(<Example onOpenChange={onOpenChange} />);
    await user.hover(trigger());
    unmount();
    elapse(2000);
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(document.querySelector('[popover]')).toBeNull();
  });
});

function InsidePopover(): ReactElement {
  return (
    <StrictMode>
      <Popover.Root>
        <Popover.Trigger>Share</Popover.Trigger>
        <Popover.Content aria-label="Share panel">
          <Tooltip.Root>
            <Tooltip.Trigger aria-label="Copy link">Copy</Tooltip.Trigger>
            <Tooltip.Content>Copy the link</Tooltip.Content>
          </Tooltip.Root>
        </Popover.Content>
      </Popover.Root>
    </StrictMode>
  );
}

describe('Tooltip inside a Popover', () => {
  it('shows above the popover, hides on the first Escape and leaves the popover to the second', async () => {
    const user = setup();
    render(<InsidePopover />);
    await user.click(screen.getByRole('button', { name: 'Share' }));
    await screen.findByRole('dialog', { name: 'Share panel' });
    elapse(20);
    await waitFor(() => {
      expect(document.activeElement).toBe(trigger());
    });
    await waitFor(() => {
      expect(isOpen()).toBe(true);
    });
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(isOpen()).toBe(false);
    });
    expect(screen.getByRole('dialog', { name: 'Share panel' }).isConnected).toBe(true);
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  it('does not close the popover on a press on the tooltip content', async () => {
    const user = setup();
    render(<InsidePopover />);
    await user.click(screen.getByRole('button', { name: 'Share' }));
    await waitFor(() => {
      expect(isOpen()).toBe(true);
    });
    await user.pointer({ keys: '[MouseLeft]', target: shown() });
    expect(screen.getByRole('dialog', { name: 'Share panel' }).isConnected).toBe(true);
  });
});
