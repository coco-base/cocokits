// @vitest-environment jsdom
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, StrictMode, useState, type ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Popover } from '../../popover';
import { Dialog } from '../index';
import { boxAt, cssAnimation, Example, nextFrame, pressOn, stubTopLayer } from './fixtures';

beforeEach(stubTopLayer);
afterEach(() => {
  cleanup();
  Reflect.deleteProperty(HTMLElement.prototype, 'getAnimations');
  vi.restoreAllMocks();
  document.body.innerHTML = '';
  document.documentElement.removeAttribute('style');
});

type User = ReturnType<typeof userEvent.setup>;

const trigger = (): HTMLElement => screen.getByRole('button', { name: 'Delete' });
const content = (): HTMLDialogElement | null => screen.queryByRole<HTMLDialogElement>('dialog');
const isOpen = (): boolean => content() !== null;
const button = (name: string): HTMLElement => screen.getByRole('button', { name });
const reasons = (fn: ReturnType<typeof vi.fn>): unknown[] =>
  fn.mock.calls.map((call: unknown[]) => [call[0], (call[1] as { reason: string }).reason]);
const closed = (): Promise<void> =>
  waitFor(() => {
    expect(isOpen()).toBe(false);
  });

describe('Dialog rendered contract', () => {
  it('renders only the trigger while closed', () => {
    render(<Example />);
    expect(trigger().tagName).toBe('BUTTON');
    expect(trigger().className).toBe('cck-dialog__trigger');
    expect(trigger().getAttribute('type')).toBe('button');
    expect(trigger().getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    expect(trigger().hasAttribute('aria-controls')).toBe(false);
    expect(trigger().getAttribute('data-state')).toBe('closed');
    expect(isOpen()).toBe(false);
    expect(document.querySelector('[popover]')).toBeNull();
  });

  it('renders a native modal dialog in a top-layer host outside the trigger parent, labelled and described', async () => {
    const { container } = render(<Example />);
    await userEvent.click(trigger());
    const dialog = content();
    expect(dialog).not.toBeNull();
    expect(dialog?.tagName).toBe('DIALOG');
    expect(dialog?.open).toBe(true);
    expect(dialog?.matches(':modal')).toBe(true);
    expect(dialog?.className).toBe('cck-dialog__content');
    expect(dialog?.hasAttribute('role')).toBe(false);
    expect(dialog?.hasAttribute('aria-modal')).toBe(false);
    expect(dialog?.getAttribute('data-state')).toBe('open');
    expect(container.contains(dialog)).toBe(false);
    expect(dialog?.parentElement?.getAttribute('popover')).toBe('manual');
    const title = screen.getByRole('heading', { name: 'Delete project' });
    const description = screen.getByText('This cannot be undone.');
    expect(title.tagName).toBe('H2');
    expect(title.className).toBe('cck-dialog__title');
    expect(description.tagName).toBe('P');
    expect(description.className).toBe('cck-dialog__description');
    expect(dialog?.getAttribute('aria-labelledby')).toBe(title.id);
    expect(dialog?.getAttribute('aria-describedby')).toBe(description.id);
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(trigger().getAttribute('data-state')).toBe('open');
    expect(trigger().getAttribute('aria-controls')).toBe(dialog?.id);
    expect(button('Cancel').className).toBe('cck-dialog__close');
    expect(button('Cancel').getAttribute('type')).toBe('button');
  });

  it('has no aria-labelledby or aria-describedby without a Title and a Description', async () => {
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Trigger>Delete</Dialog.Trigger>
        <Dialog.Content aria-label="Plain">text</Dialog.Content>
      </Dialog.Root>,
    );
    await waitFor(() => {
      expect(isOpen()).toBe(true);
    });
    expect(content()?.hasAttribute('aria-labelledby')).toBe(false);
    expect(content()?.hasAttribute('aria-describedby')).toBe(false);
  });

  it('adds no focus guard and no manual inert: the native modal needs neither', async () => {
    render(<Example />);
    await userEvent.click(trigger());
    expect(content()?.parentElement?.querySelectorAll('[tabindex]').length).toBe(0);
    expect(document.querySelector('[inert]')).toBeNull();
  });

  it('routes ref, className and a render element to the parts (Content is always a native dialog) and keeps the fixed class', async () => {
    const triggerRef = createRef<HTMLButtonElement>();
    const contentRef = createRef<HTMLDialogElement>();
    const titleRef = createRef<HTMLHeadingElement>();
    const closeRef = createRef<HTMLButtonElement>();
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Trigger ref={triggerRef} className="mine" render={<button data-mine="" />}>
          Delete
        </Dialog.Trigger>
        <Dialog.Content ref={contentRef} className="mine">
          <Dialog.Title ref={titleRef} className="mine" render={<h3 />}>
            Heading
          </Dialog.Title>
          <Dialog.Close ref={closeRef} className="mine" render={<button type="button" data-close="" />}>
            Cancel
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Root>,
    );
    await waitFor(() => {
      expect(isOpen()).toBe(true);
    });
    expect(triggerRef.current).toBe(trigger());
    expect(trigger().className).toBe('cck-dialog__trigger mine');
    expect(trigger().hasAttribute('data-mine')).toBe(true);
    expect(contentRef.current).toBe(content());
    expect(content()?.className).toBe('cck-dialog__content mine');
    expect(titleRef.current?.tagName).toBe('H3');
    expect(titleRef.current?.className).toBe('cck-dialog__title mine');
    expect(closeRef.current).toBe(button('Cancel'));
    expect(closeRef.current?.hasAttribute('data-close')).toBe(true);
  });

  it('does not let an attribute from the author replace the state facts', async () => {
    const extra = { 'aria-expanded': 'true', id: 'mine' } as const;
    render(
      <Dialog.Root>
        <Dialog.Trigger {...extra}>Delete</Dialog.Trigger>
        <Dialog.Content aria-label="x" {...extra}>
          text
        </Dialog.Content>
      </Dialog.Root>,
    );
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    await userEvent.click(trigger());
    expect(content()?.id).not.toBe('mine');
    expect(trigger().getAttribute('aria-controls')).toBe(content()?.id);
  });

  it('throws the documented error when a part is outside the root', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<Dialog.Trigger>x</Dialog.Trigger>)).toThrow(
      'CocoKits: <Dialog.Trigger> must be placed within <Dialog.Root>.',
    );
    expect(() => render(<Dialog.Content>x</Dialog.Content>)).toThrow(
      'CocoKits: <Dialog.Content> must be placed within <Dialog.Root>.',
    );
    expect(() => render(<Dialog.Close>x</Dialog.Close>)).toThrow(
      'CocoKits: <Dialog.Close> must be placed within <Dialog.Root>.',
    );
  });

  it('warns in development when the content has no accessible name, and not when a Title names it', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Trigger>Delete</Dialog.Trigger>
        <Dialog.Content>text</Dialog.Content>
      </Dialog.Root>,
    );
    await waitFor(() => {
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('<Dialog.Content> has no accessible name'));
    });
    cleanup();
    warn.mockClear();
    render(<Example defaultOpen />);
    await waitFor(() => {
      expect(isOpen()).toBe(true);
    });
    await nextFrame();
    expect(warn).not.toHaveBeenCalled();
  });
});

describe('Dialog open state', () => {
  it('toggles on the trigger and reports each change once with its reason', async () => {
    const onOpenChange = vi.fn();
    render(<Example onOpenChange={onOpenChange} />);
    await userEvent.click(trigger());
    expect(isOpen()).toBe(true);
    await userEvent.click(button('Cancel'));
    await closed();
    expect(reasons(onOpenChange)).toEqual([
      [true, 'trigger'],
      [false, 'close'],
    ]);
    expect((onOpenChange.mock.calls[0]?.[1] as { event: unknown }).event).toBeInstanceOf(Event);
  });

  it('opens on Enter and Space on the trigger and puts focus inside', async () => {
    render(<Example />);
    trigger().focus();
    await userEvent.keyboard('{Enter}');
    expect(isOpen()).toBe(true);
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'First' }));
    await userEvent.keyboard('{Escape}');
    await closed();
    await waitFor(() => {
      expect(document.activeElement).toBe(trigger());
    });
    await userEvent.keyboard(' ');
    expect(isOpen()).toBe(true);
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
    await closed();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('works as a controlled dialog that the parent updates', async () => {
    function Controlled(): ReactElement {
      const [open, setOpen] = useState(false);
      return <Example open={open} onOpenChange={setOpen} />;
    }
    render(<Controlled />);
    await userEvent.click(trigger());
    expect(isOpen()).toBe(true);
    await userEvent.click(button('Cancel'));
    await closed();
  });

  it('lets a preventDefault of the author on the trigger click veto the open', async () => {
    render(
      <Dialog.Root>
        <Dialog.Trigger
          onClick={(event) => {
            event.preventDefault();
          }}
        >
          Delete
        </Dialog.Trigger>
        <Dialog.Content aria-label="x">text</Dialog.Content>
      </Dialog.Root>,
    );
    await userEvent.click(trigger());
    expect(isOpen()).toBe(false);
  });

  it('lets a preventDefault of the author on Close veto the close', async () => {
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Trigger>Delete</Dialog.Trigger>
        <Dialog.Content aria-label="x">
          <Dialog.Close
            onClick={(event) => {
              event.preventDefault();
            }}
          >
            Cancel
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Root>,
    );
    await waitFor(() => {
      expect(isOpen()).toBe(true);
    });
    await userEvent.click(button('Cancel'));
    expect(isOpen()).toBe(true);
  });

  it('keeps the content until the exit animation has finished', async () => {
    render(<Example />);
    await userEvent.click(trigger());
    const dialog = content();
    let finish: () => void = () => undefined;
    const finished = new Promise<void>((resolve) => {
      finish = resolve;
    });
    Object.defineProperty(dialog, 'getAnimations', { value: () => [cssAnimation(finished)], configurable: true });
    await userEvent.keyboard('{Escape}');
    await nextFrame();
    expect(content()?.getAttribute('data-state')).toBe('closed');
    expect(trigger().getAttribute('aria-controls')).toBe(dialog?.id);
    finish();
    await closed();
    expect(trigger().hasAttribute('aria-controls')).toBe(false);
  });

  it('warns when the open prop switches between controlled and uncontrolled', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const ui = (open: boolean | undefined): ReactElement => (
      <Dialog.Root open={open}>
        <Dialog.Trigger>Delete</Dialog.Trigger>
      </Dialog.Root>
    );
    const { rerender } = render(ui(undefined));
    rerender(ui(true));
    expect(error).toHaveBeenCalledWith(expect.stringContaining('<Dialog.Root open>'));
  });
});

describe('Dialog dismissal reasons', () => {
  it.each([
    ['Escape', async (user: User) => user.keyboard('{Escape}'), 'escape'],
    ['Close', async (user: User) => user.click(button('Cancel')), 'close'],
    [
      'a press on the backdrop',
      () => {
        const dialog = content();
        if (!dialog) throw new Error('no dialog');
        boxAt(dialog);
        pressOn(dialog, { clientX: 10, clientY: 10 });
      },
      'outside-press',
    ],
    [
      'the platform closing the dialog (form method=dialog)',
      () => {
        content()?.close();
      },
      'close',
    ],
  ] as const)('reports the reason for %s', async (_name, perform, reason) => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Example onOpenChange={onOpenChange} />);
    await user.click(trigger());
    await perform(user);
    await closed();
    expect(reasons(onOpenChange).at(-1)).toEqual([false, reason]);
  });

  it('does not close on a press inside the dialog box, including its own padding', async () => {
    render(<Example />);
    await userEvent.click(trigger());
    const dialog = content();
    if (!dialog) throw new Error('no dialog');
    boxAt(dialog);
    pressOn(dialog, { clientX: 150, clientY: 150 });
    await userEvent.click(screen.getByText('This cannot be undone.'));
    expect(isOpen()).toBe(true);
  });

  it('lets a controlled parent refuse a dismissal and keeps the dialog modal', async () => {
    const onOpenChange = vi.fn();
    render(<Example open onOpenChange={onOpenChange} />);
    await waitFor(() => {
      expect(isOpen()).toBe(true);
    });
    await userEvent.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false, expect.objectContaining({ reason: 'escape' }));
    expect(isOpen()).toBe(true);
    expect(content()?.matches(':modal')).toBe(true);
  });

  it('shows the dialog again when the platform closes it and the parent refuses', async () => {
    render(<Example open onOpenChange={() => undefined} />);
    await waitFor(() => {
      expect(isOpen()).toBe(true);
    });
    act(() => {
      content()?.close();
    });
    await nextFrame();
    await waitFor(() => {
      expect(content()?.open).toBe(true);
    });
  });
});

describe('Dialog focus', () => {
  it('lets the native focusing steps place focus: the first focusable element', async () => {
    render(<Example />);
    await userEvent.click(trigger());
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'First' }));
  });

  it.each([
    ['Escape', async (user: User) => user.keyboard('{Escape}')],
    ['Close', async (user: User) => user.click(button('Cancel'))],
    [
      'a press on the backdrop',
      () => {
        const dialog = content();
        if (!dialog) throw new Error('no dialog');
        boxAt(dialog);
        pressOn(dialog, { clientX: 10, clientY: 10 });
      },
    ],
  ] as const)('returns to the trigger on %s', async (_name, perform) => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(trigger());
    await perform(user);
    await closed();
    await waitFor(() => {
      expect(document.activeElement).toBe(trigger());
    });
  });

  it('does not take focus back from the trigger when the whole tree is removed while open', async () => {
    const { unmount } = render(<Example />);
    await userEvent.click(trigger());
    const other = document.createElement('button');
    document.body.append(other);
    unmount();
    other.focus();
    await nextFrame();
    expect(document.activeElement).toBe(other);
  });
});

describe('Dialog scroll lock', () => {
  it('locks the page scroll while open and restores it on close and on unmount', async () => {
    const { unmount } = render(<Example />);
    expect(document.documentElement.style.overflow).toBe('');
    await userEvent.click(trigger());
    expect(document.documentElement.style.overflow).toBe('hidden');
    await userEvent.keyboard('{Escape}');
    await closed();
    expect(document.documentElement.style.overflow).toBe('');
    await userEvent.click(trigger());
    expect(document.documentElement.style.overflow).toBe('hidden');
    unmount();
    expect(document.documentElement.style.overflow).toBe('');
    expect(document.querySelector('[popover="manual"]')).toBeNull();
  });
});

function NestedDialogs(): ReactElement {
  return (
    <StrictMode>
      <Dialog.Root>
        <Dialog.Trigger>Outer</Dialog.Trigger>
        <Dialog.Content aria-label="Outer dialog">
          <Dialog.Root>
            <Dialog.Trigger>Inner</Dialog.Trigger>
            <Dialog.Content aria-label="Inner dialog">
              <Dialog.Close>Done</Dialog.Close>
            </Dialog.Content>
          </Dialog.Root>
        </Dialog.Content>
      </Dialog.Root>
    </StrictMode>
  );
}

function PopoverInDialog(): ReactElement {
  return (
    <StrictMode>
      <Dialog.Root>
        <Dialog.Trigger>Delete</Dialog.Trigger>
        <Dialog.Content aria-label="Delete project">
          <Popover.Root>
            <Popover.Trigger>More</Popover.Trigger>
            <Popover.Content aria-label="More options">
              <button>Inside popover</button>
            </Popover.Content>
          </Popover.Root>
        </Dialog.Content>
      </Dialog.Root>
    </StrictMode>
  );
}

describe('Dialog nesting', () => {
  it('opens a dialog from a dialog inside the outer one; Escape closes the inner only, focus goes back to its trigger and the lock stays', async () => {
    const user = userEvent.setup();
    render(<NestedDialogs />);
    await user.click(button('Outer'));
    const outer = screen.getByRole('dialog', { name: 'Outer dialog' });
    await user.click(button('Inner'));
    const inner = screen.getByRole('dialog', { name: 'Inner dialog' });
    expect(outer.contains(inner)).toBe(true);
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Inner dialog' })).toBeNull();
    });
    expect(screen.getByRole('dialog', { name: 'Outer dialog' }).isConnected).toBe(true);
    expect(document.documentElement.style.overflow).toBe('hidden');
    await waitFor(() => {
      expect(document.activeElement).toBe(button('Inner'));
    });
    await user.keyboard('{Escape}');
    await closed();
    expect(document.documentElement.style.overflow).toBe('');
  });

  it('nests a Popover opened inside the Dialog: its host is in the dialog, a press in it is inside, Escape closes it first', async () => {
    const user = userEvent.setup();
    render(<PopoverInDialog />);
    await user.click(button('Delete'));
    const dialog = screen.getByRole('dialog', { name: 'Delete project' });
    await user.click(button('More'));
    const popover = await screen.findByRole('dialog', { name: 'More options' });
    expect(dialog.contains(popover)).toBe(true);
    await user.click(button('Inside popover'));
    expect(screen.getByRole('dialog', { name: 'More options' }).isConnected).toBe(true);
    expect(screen.getByRole('dialog', { name: 'Delete project' }).isConnected).toBe(true);
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'More options' })).toBeNull();
    });
    expect(screen.getByRole('dialog', { name: 'Delete project' }).isConnected).toBe(true);
    await user.keyboard('{Escape}');
    await closed();
  });
});
