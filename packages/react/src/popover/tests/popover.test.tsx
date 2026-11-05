// @vitest-environment jsdom
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, StrictMode, useState, type ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Popover } from '../index';
import { button, Example, nextFrame, stubTopLayer, trigger } from './fixtures';

beforeEach(stubTopLayer);
afterEach(() => {
  cleanup();
  Reflect.deleteProperty(HTMLElement.prototype, 'getAnimations');
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const content = (): HTMLElement | null => screen.queryByRole('dialog');
const isOpen = (): boolean => content() !== null;
const reasons = (fn: ReturnType<typeof vi.fn>): unknown[] =>
  fn.mock.calls.map((call: unknown[]) => [call[0], (call[1] as { reason: string }).reason]);

describe('Popover rendered contract', () => {
  it('renders only the trigger while closed', () => {
    render(<Example />);
    expect(trigger().tagName).toBe('BUTTON');
    expect(trigger().className).toBe('cck-popover__trigger');
    expect(trigger().getAttribute('type')).toBe('button');
    expect(trigger().getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    expect(trigger().hasAttribute('aria-controls')).toBe(false);
    expect(trigger().getAttribute('data-state')).toBe('closed');
    expect(isOpen()).toBe(false);
    expect(document.querySelector('[popover]')).toBeNull();
  });

  it('renders the content in a top-layer host outside the trigger parent, linked by ids', async () => {
    const { container } = render(<Example />);
    await userEvent.click(trigger());
    const dialog = content();
    expect(dialog).not.toBeNull();
    expect(dialog?.tagName).toBe('DIV');
    expect(dialog?.className).toBe('cck-popover__content');
    expect(dialog?.getAttribute('aria-label')).toBe('Share link');
    expect(dialog?.getAttribute('tabindex')).toBe('-1');
    expect(dialog?.hasAttribute('aria-modal')).toBe(false);
    expect(dialog?.getAttribute('data-state')).toBe('open');
    expect(dialog?.getAttribute('data-side')).toBe('bottom');
    expect(dialog?.getAttribute('data-align')).toBe('center');
    expect(container.contains(dialog)).toBe(false);
    expect(dialog?.parentElement?.getAttribute('popover')).toBe('manual');
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(trigger().getAttribute('data-state')).toBe('open');
    expect(trigger().getAttribute('aria-controls')).toBe(dialog?.id);
    expect(button('Done').className).toBe('cck-popover__close');
  });

  it('positions the content with position fixed', async () => {
    render(
      <Popover.Root defaultOpen>
        <Popover.Trigger>Share</Popover.Trigger>
        <Popover.Content aria-label="x" side="top" align="start" />
      </Popover.Root>,
    );
    await waitFor(() => {
      expect(content()?.style.position).toBe('fixed');
    });
  });

  it('routes ref, className and a render element to the parts and keeps the fixed class', async () => {
    const triggerRef = createRef<HTMLButtonElement>();
    const contentRef = createRef<HTMLDivElement>();
    const closeRef = createRef<HTMLButtonElement>();
    render(
      <Popover.Root defaultOpen>
        <Popover.Trigger ref={triggerRef} className="mine" render={<button data-mine="" />}>
          Share
        </Popover.Trigger>
        <Popover.Content ref={contentRef} className="mine" aria-label="x" render={(props) => <section {...props} />}>
          <Popover.Close ref={closeRef} className="mine" render={<button type="button" data-close="" />}>
            Done
          </Popover.Close>
        </Popover.Content>
      </Popover.Root>,
    );
    await waitFor(() => {
      expect(content()).not.toBeNull();
    });
    expect(triggerRef.current).toBe(trigger());
    expect(trigger().className).toBe('cck-popover__trigger mine');
    expect(trigger().hasAttribute('data-mine')).toBe(true);
    expect(contentRef.current).toBe(content());
    expect(content()?.tagName).toBe('SECTION');
    expect(content()?.className).toBe('cck-popover__content mine');
    expect(closeRef.current).toBe(button('Done'));
    expect(closeRef.current?.hasAttribute('data-close')).toBe(true);
  });

  it('does not let an attribute from the author replace the state facts', async () => {
    const extra = { 'aria-expanded': 'true', id: 'mine' } as const;
    render(
      <Popover.Root>
        <Popover.Trigger {...extra}>Share</Popover.Trigger>
        <Popover.Content aria-label="x" {...extra} role="menu">
          text
        </Popover.Content>
      </Popover.Root>,
    );
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    await userEvent.click(trigger());
    expect(content()?.getAttribute('role')).toBe('dialog');
    expect(content()?.id).not.toBe('mine');
    expect(trigger().getAttribute('aria-controls')).toBe(content()?.id);
  });

  it('throws the documented error when a part is outside the root', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<Popover.Trigger>x</Popover.Trigger>)).toThrow(
      'CocoKits: <Popover.Trigger> must be placed within <Popover.Root>.',
    );
    expect(() => render(<Popover.Content>x</Popover.Content>)).toThrow(
      'CocoKits: <Popover.Content> must be placed within <Popover.Root>.',
    );
    expect(() => render(<Popover.Close>x</Popover.Close>)).toThrow(
      'CocoKits: <Popover.Close> must be placed within <Popover.Root>.',
    );
  });

  it('warns in development when the content has no accessible name', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(
      <Popover.Root defaultOpen>
        <Popover.Trigger>Share</Popover.Trigger>
        <Popover.Content>text</Popover.Content>
      </Popover.Root>,
    );
    await waitFor(() => {
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('<Popover.Content> has no accessible name'));
    });
  });
});

describe('Popover open state', () => {
  it('toggles on the trigger and reports each change once with its reason', async () => {
    const onOpenChange = vi.fn();
    render(<Example onOpenChange={onOpenChange} />);
    await userEvent.click(trigger());
    expect(isOpen()).toBe(true);
    await userEvent.click(trigger());
    await waitFor(() => {
      expect(isOpen()).toBe(false);
    });
    expect(reasons(onOpenChange)).toEqual([
      [true, 'trigger'],
      [false, 'trigger'],
    ]);
    expect((onOpenChange.mock.calls[0]?.[1] as { event: unknown }).event).toBeInstanceOf(Event);
  });

  it('toggles on Enter and Space on the trigger', async () => {
    render(<Example />);
    trigger().focus();
    await userEvent.keyboard('{Enter}');
    expect(isOpen()).toBe(true);
    await waitFor(() => {
      expect(document.activeElement).toBe(button('copy'));
    });
    trigger().focus();
    await userEvent.keyboard(' ');
    await waitFor(() => {
      expect(isOpen()).toBe(false);
    });
  });

  it('opens by default after the first render and reports nothing', async () => {
    const onOpenChange = vi.fn();
    render(<Example defaultOpen onOpenChange={onOpenChange} />);
    await waitFor(() => {
      expect(isOpen()).toBe(true);
    });
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('keeps a controlled open when the parent ignores the request, and follows the prop', async () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(<Example open={false} onOpenChange={onOpenChange} />);
    await userEvent.click(trigger());
    expect(onOpenChange).toHaveBeenCalledWith(true, expect.objectContaining({ reason: 'trigger' }));
    expect(isOpen()).toBe(false);
    rerender(<Example open onOpenChange={onOpenChange} />);
    await waitFor(() => {
      expect(isOpen()).toBe(true);
    });
    onOpenChange.mockClear();
    rerender(<Example open={false} onOpenChange={onOpenChange} />);
    await waitFor(() => {
      expect(isOpen()).toBe(false);
    });
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('works as a controlled popover that the parent updates', async () => {
    function Controlled(): ReactElement {
      const [open, setOpen] = useState(false);
      return <Example open={open} onOpenChange={setOpen} />;
    }
    render(<Controlled />);
    await userEvent.click(trigger());
    expect(isOpen()).toBe(true);
    await userEvent.click(button('Done'));
    await waitFor(() => {
      expect(isOpen()).toBe(false);
    });
  });

  it('lets a preventDefault of the author on the trigger click veto the toggle', async () => {
    render(
      <Popover.Root>
        <Popover.Trigger
          onClick={(event) => {
            event.preventDefault();
          }}
        >
          Share
        </Popover.Trigger>
        <Popover.Content aria-label="x">text</Popover.Content>
      </Popover.Root>,
    );
    await userEvent.click(trigger());
    expect(isOpen()).toBe(false);
  });

  it('lets a preventDefault of the author on Close veto the close', async () => {
    render(
      <Popover.Root defaultOpen>
        <Popover.Trigger>Share</Popover.Trigger>
        <Popover.Content aria-label="x">
          <Popover.Close
            onClick={(event) => {
              event.preventDefault();
            }}
          >
            Done
          </Popover.Close>
        </Popover.Content>
      </Popover.Root>,
    );
    await waitFor(() => {
      expect(isOpen()).toBe(true);
    });
    await userEvent.click(button('Done'));
    expect(isOpen()).toBe(true);
  });

  it('warns when the open prop switches between controlled and uncontrolled', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const ui = (open: boolean | undefined): ReactElement => (
      <Popover.Root open={open}>
        <Popover.Trigger>Share</Popover.Trigger>
      </Popover.Root>
    );
    const { rerender } = render(ui(undefined));
    rerender(ui(true));
    expect(error).toHaveBeenCalledWith(expect.stringContaining('changed from uncontrolled to controlled'));
  });

  it('keeps the content while an exit animation runs, then removes it', async () => {
    let resolveFinish: () => void = () => undefined;
    const finished = new Promise<void>((resolve) => {
      resolveFinish = resolve;
    });
    HTMLElement.prototype.getAnimations = () => [
      {
        finished,
        animationName: 'exit',
        playState: 'running',
        effect: { getComputedTiming: () => ({ endTime: 300 }) },
      } as unknown as Animation,
    ];
    render(<Example defaultOpen />);
    await waitFor(() => {
      expect(isOpen()).toBe(true);
    });
    await userEvent.click(button('Done'));
    expect(content()?.getAttribute('data-state')).toBe('closed');
    expect(trigger().getAttribute('aria-controls')).toBe(content()?.id);
    await act(async () => {
      resolveFinish();
      await finished;
    });
    await waitFor(() => {
      expect(isOpen()).toBe(false);
    });
    expect(trigger().hasAttribute('aria-controls')).toBe(false);
  });
});

describe('Popover dismissal and focus', () => {
  it('moves focus to the first focusable element on open', async () => {
    render(<Example />);
    await userEvent.click(trigger());
    await waitFor(() => {
      expect(document.activeElement).toBe(button('copy'));
    });
  });

  it('focuses the content itself when it holds nothing focusable', async () => {
    render(
      <Popover.Root>
        <Popover.Trigger>Share</Popover.Trigger>
        <Popover.Content aria-label="x">text</Popover.Content>
      </Popover.Root>,
    );
    await userEvent.click(trigger());
    await waitFor(() => {
      expect(document.activeElement).toBe(content());
    });
  });

  it('closes on Escape, returns focus to the trigger and reports escape', async () => {
    const onOpenChange = vi.fn();
    render(<Example onOpenChange={onOpenChange} />);
    await userEvent.click(trigger());
    await waitFor(() => {
      expect(document.activeElement).toBe(button('copy'));
    });
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(isOpen()).toBe(false);
    });
    await waitFor(() => {
      expect(document.activeElement).toBe(trigger());
    });
    expect(reasons(onOpenChange)).toEqual([
      [true, 'trigger'],
      [false, 'escape'],
    ]);
  });

  it('closes on Close with reason close and returns focus to the trigger', async () => {
    const onOpenChange = vi.fn();
    render(<Example onOpenChange={onOpenChange} />);
    await userEvent.click(trigger());
    await userEvent.click(button('Done'));
    await waitFor(() => {
      expect(isOpen()).toBe(false);
    });
    await waitFor(() => {
      expect(document.activeElement).toBe(trigger());
    });
    expect(reasons(onOpenChange).at(-1)).toEqual([false, 'close']);
  });

  it('does not close on a press inside the content, and closes on a press outside', async () => {
    const onOpenChange = vi.fn();
    render(<Example onOpenChange={onOpenChange} />);
    await userEvent.click(trigger());
    await userEvent.click(screen.getByText('Anyone with the link can view.'));
    expect(isOpen()).toBe(true);
    await userEvent.click(document.body);
    await waitFor(() => {
      expect(isOpen()).toBe(false);
    });
    expect(reasons(onOpenChange).at(-1)).toEqual([false, 'outside-press']);
    await waitFor(() => {
      expect(document.activeElement).toBe(trigger());
    });
  });

  it('keeps focus on another focusable element that the outside press landed on', async () => {
    render(<Example />);
    await userEvent.click(trigger());
    const after = button('after');
    await userEvent.click(after);
    await waitFor(() => {
      expect(isOpen()).toBe(false);
    });
    await nextFrame();
    await nextFrame();
    expect(document.activeElement).toBe(after);
  });

  it('sends Tab from the last focusable to the element after the trigger and closes with focus-out', async () => {
    const onOpenChange = vi.fn();
    render(<Example onOpenChange={onOpenChange} />);
    await userEvent.click(trigger());
    await waitFor(() => {
      expect(document.activeElement).toBe(button('copy'));
    });
    await userEvent.tab();
    expect(document.activeElement).toBe(button('Done'));
    await userEvent.tab();
    await waitFor(() => {
      expect(isOpen()).toBe(false);
    });
    expect(document.activeElement).toBe(button('after'));
    expect(reasons(onOpenChange).at(-1)).toEqual([false, 'focus-out']);
  });

  it('sends Shift+Tab from the first focusable back to the trigger and closes', async () => {
    const onOpenChange = vi.fn();
    render(<Example onOpenChange={onOpenChange} />);
    await userEvent.click(trigger());
    await waitFor(() => {
      expect(document.activeElement).toBe(button('copy'));
    });
    await userEvent.tab({ shift: true });
    await waitFor(() => {
      expect(isOpen()).toBe(false);
    });
    expect(document.activeElement).toBe(trigger());
    expect(reasons(onOpenChange).at(-1)).toEqual([false, 'focus-out']);
  });

  it('closes the inner popover on Escape first, and a press inside it does not close the outer one', async () => {
    render(
      <StrictMode>
        <Popover.Root>
          <Popover.Trigger>Outer</Popover.Trigger>
          <Popover.Content aria-label="outer">
            <Popover.Root>
              <Popover.Trigger>Inner</Popover.Trigger>
              <Popover.Content aria-label="inner">
                <button>deep</button>
              </Popover.Content>
            </Popover.Root>
          </Popover.Content>
        </Popover.Root>
      </StrictMode>,
    );
    await userEvent.click(button('Outer'));
    await userEvent.click(button('Inner'));
    expect(screen.getAllByRole('dialog')).toHaveLength(2);
    await userEvent.click(button('deep'));
    expect(screen.getAllByRole('dialog')).toHaveLength(2);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.getAllByRole('dialog')).toHaveLength(1);
    });
    expect(screen.getByRole('dialog', { name: 'outer' })).toBeTruthy();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(isOpen()).toBe(false);
    });
  });

  it('removes its listeners and the host on unmount', async () => {
    const { unmount } = render(<Example defaultOpen />);
    await waitFor(() => {
      expect(isOpen()).toBe(true);
    });
    const remove = vi.spyOn(document, 'removeEventListener');
    unmount();
    expect(document.querySelector('[popover]')).toBeNull();
    expect(remove).toHaveBeenCalledWith('keydown', expect.any(Function), true);
    expect(remove).toHaveBeenCalledWith('pointerdown', expect.any(Function), true);
    expect(remove).toHaveBeenCalledWith('focusin', expect.any(Function), true);
  });
});
