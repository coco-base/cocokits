// @vitest-environment jsdom
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode, useState, type ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Dialog, type DialogContentProps, type DialogRootProps } from '../index';
import { boxAt, nextFrame, pressOn, stubTopLayer } from './fixtures';

beforeEach(stubTopLayer);
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
  document.documentElement.removeAttribute('style');
});

const content = (): HTMLDialogElement | null => screen.queryByRole<HTMLDialogElement>('dialog');
const button = (name: string): HTMLElement => screen.getByRole('button', { name });

function Refusable({ root, ...handlers }: DialogContentProps & { readonly root?: DialogRootProps }): ReactElement {
  return (
    <StrictMode>
      <Dialog.Root {...root}>
        <Dialog.Trigger>Delete</Dialog.Trigger>
        <Dialog.Content aria-label="Delete project" {...handlers}>
          <button>inside</button>
          <Dialog.Close>Cancel</Dialog.Close>
        </Dialog.Content>
      </Dialog.Root>
    </StrictMode>
  );
}

const backdropPress = (): void => {
  const dialog = content();
  if (!dialog) throw new Error('no dialog');
  boxAt(dialog);
  pressOn(dialog, { clientX: 10, clientY: 10 });
};

describe('Dialog Content handlers', () => {
  it('onEscapeKeyDown gets the key and refuses with preventDefault; otherwise the dialog closes', async () => {
    const onEscapeKeyDown = vi.fn((event: KeyboardEvent) => {
      event.preventDefault();
    });
    const { rerender } = render(<Refusable onEscapeKeyDown={onEscapeKeyDown} />);
    await userEvent.click(button('Delete'));
    await userEvent.keyboard('{Escape}');
    expect(onEscapeKeyDown).toHaveBeenCalledOnce();
    expect(onEscapeKeyDown.mock.calls[0]?.[0].key).toBe('Escape');
    expect(content()?.open).toBe(true);
    rerender(<Refusable onEscapeKeyDown={vi.fn()} />);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(content()).toBeNull();
    });
  });

  it('onPointerDownOutside refuses a backdrop press, and onInteractOutside follows it with the same event', async () => {
    const calls: string[] = [];
    let first: Event | undefined;
    render(
      <Refusable
        onPointerDownOutside={(event) => {
          calls.push('pointer');
          first = event;
          expect(event.detail.originalEvent.type).toBe('pointerdown');
          event.preventDefault();
        }}
        onInteractOutside={(event) => {
          calls.push('interact');
          expect(event).toBe(first);
          expect(event.defaultPrevented).toBe(true);
        }}
      />,
    );
    await userEvent.click(button('Delete'));
    backdropPress();
    expect(calls).toEqual(['pointer', 'interact']);
    expect(content()?.open).toBe(true);
  });

  it('onInteractOutside alone refuses a backdrop press', async () => {
    render(
      <Refusable
        onInteractOutside={(event) => {
          event.preventDefault();
        }}
      />,
    );
    await userEvent.click(button('Delete'));
    backdropPress();
    expect(content()?.open).toBe(true);
  });

  it('keeps focus inside the dialog after a refused backdrop press', async () => {
    render(
      <Refusable
        onPointerDownOutside={(event) => {
          event.preventDefault();
        }}
      />,
    );
    await userEvent.click(button('Delete'));
    backdropPress();
    await nextFrame();
    expect(content()?.contains(document.activeElement)).toBe(true);
  });

  it('calls no key handler for a close request without a key, and details.cancel() refuses it', async () => {
    const onEscapeKeyDown = vi.fn();
    const onOpenChange = vi.fn((open: boolean, details: { cancel(): void }) => {
      if (!open) details.cancel();
    });
    render(<Refusable onEscapeKeyDown={onEscapeKeyDown} root={{ onOpenChange }} />);
    await userEvent.click(button('Delete'));
    onOpenChange.mockClear();
    act(() => {
      content()?.dispatchEvent(new Event('cancel', { cancelable: true }));
    });
    expect(onEscapeKeyDown).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenLastCalledWith(false, expect.objectContaining({ reason: 'escape' }));
    expect(content()?.open).toBe(true);
  });
});

describe('Dialog details.cancel()', () => {
  it('keeps a closed uncontrolled dialog closed when the open is canceled', async () => {
    const onOpenChange = vi.fn((_open: boolean, details: { cancel(): void }) => {
      details.cancel();
    });
    render(<Refusable root={{ onOpenChange }} />);
    await userEvent.click(button('Delete'));
    expect(content()).toBeNull();
    expect(onOpenChange).toHaveBeenLastCalledWith(true, expect.objectContaining({ isCanceled: true }));
  });

  it('refuses every way of closing, tells isCanceled and shows a form-closed dialog again', async () => {
    let refuse = false;
    const seen: boolean[] = [];
    const onOpenChange = vi.fn((_open: boolean, details: { cancel(): void; readonly isCanceled: boolean }) => {
      expect(details.isCanceled).toBe(false);
      if (refuse) details.cancel();
      seen.push(details.isCanceled);
    });
    render(<Refusable root={{ onOpenChange }} />);
    await userEvent.click(button('Delete'));
    refuse = true;
    await userEvent.keyboard('{Escape}');
    backdropPress();
    await userEvent.click(button('Cancel'));
    act(() => {
      content()?.close();
    });
    await nextFrame();
    await waitFor(() => {
      expect(content()?.open).toBe(true);
    });
    expect(seen).toEqual([false, true, true, true, true]);
    expect(content()?.matches(':modal')).toBe(true);
    refuse = false;
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(content()).toBeNull();
    });
  });

  it('keeps the layers below open when the upper dialog is refused', async () => {
    const onOuter = vi.fn();
    render(
      <StrictMode>
        <Dialog.Root onOpenChange={onOuter}>
          <Dialog.Trigger>Outer</Dialog.Trigger>
          <Dialog.Content aria-label="outer">
            <Dialog.Root
              onOpenChange={(open, details) => {
                if (!open) details.cancel();
              }}
            >
              <Dialog.Trigger>Inner</Dialog.Trigger>
              <Dialog.Content aria-label="inner">inner</Dialog.Content>
            </Dialog.Root>
          </Dialog.Content>
        </Dialog.Root>
      </StrictMode>,
    );
    await userEvent.click(button('Outer'));
    await userEvent.click(button('Inner'));
    onOuter.mockClear();
    await userEvent.keyboard('{Escape}');
    expect(screen.getByRole('dialog', { name: 'inner' }).hasAttribute('open')).toBe(true);
    expect(onOuter).not.toHaveBeenCalled();
  });
});

describe('Dialog open and close hooks', () => {
  it('calls onOpenAutoFocus once after showModal(), with focus already inside', async () => {
    let inside: boolean | undefined;
    const onOpenAutoFocus = vi.fn(() => {
      inside = content()?.contains(document.activeElement);
    });
    render(<Refusable onOpenAutoFocus={onOpenAutoFocus} />);
    await userEvent.click(button('Delete'));
    expect(onOpenAutoFocus).toHaveBeenCalledOnce();
    expect(inside).toBe(true);
  });

  it('keeps the focus a handler gives to another element', async () => {
    render(
      <Refusable
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          screen.getByRole('button', { name: 'Cancel' }).focus();
        }}
      />,
    );
    await userEvent.click(button('Delete'));
    await nextFrame();
    expect(document.activeElement).toBe(button('Cancel'));
  });

  it('returns focus to the opener, unless onCloseAutoFocus prevents it', async () => {
    const prevent = vi.fn((event: Event) => {
      event.preventDefault();
    });
    const { rerender } = render(<Refusable onCloseAutoFocus={prevent} />);
    await userEvent.click(button('Delete'));
    await userEvent.click(button('Cancel'));
    await waitFor(() => {
      expect(content()).toBeNull();
    });
    await nextFrame();
    expect(prevent).toHaveBeenCalledOnce();
    expect(document.activeElement).not.toBe(button('Delete'));

    rerender(<Refusable />);
    await userEvent.click(button('Delete'));
    await userEvent.click(button('Cancel'));
    await waitFor(() => {
      expect(document.activeElement).toBe(button('Delete'));
    });
  });
});

describe('A Dialog without a Trigger', () => {
  function Triggerless({ label = 'No trigger' }: { readonly label?: string }): ReactElement {
    const [open, setOpen] = useState(false);
    return (
      <StrictMode>
        <button
          onClick={() => {
            setOpen(true);
          }}
        >
          Open it
        </button>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Content aria-label={label}>
            <Dialog.Close>Cancel</Dialog.Close>
          </Dialog.Content>
        </Dialog.Root>
      </StrictMode>
    );
  }

  const Opened = ({ open }: { readonly open: boolean }): ReactElement => (
    <Dialog.Root open={open}>
      <Dialog.Content aria-label="No trigger">x</Dialog.Content>
    </Dialog.Root>
  );

  it('opens, and returns focus to the element that had focus', async () => {
    render(<Triggerless />);
    await userEvent.click(button('Open it'));
    const dialog = await screen.findByRole<HTMLDialogElement>('dialog', { name: 'No trigger' });
    expect(dialog.open).toBe(true);
    await userEvent.click(button('Cancel'));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    await waitFor(() => {
      expect(document.activeElement).toBe(button('Open it'));
    });
  });

  it('opens inside the open modal that holds the opener', async () => {
    render(
      <StrictMode>
        <Dialog.Root>
          <Dialog.Trigger>Outer</Dialog.Trigger>
          <Dialog.Content aria-label="outer">
            <Triggerless />
          </Dialog.Content>
        </Dialog.Root>
      </StrictMode>,
    );
    await userEvent.click(button('Outer'));
    await userEvent.click(button('Open it'));
    const inner = await screen.findByRole('dialog', { name: 'No trigger' });
    expect(screen.getByRole('dialog', { name: 'outer' }).contains(inner)).toBe(true);
  });

  it('opens in the shadow root that holds the opener', async () => {
    const host = document.body.appendChild(document.createElement('div'));
    const root = host.attachShadow({ mode: 'open' });
    const opener = root.appendChild(document.createElement('button'));
    const { rerender } = render(<Opened open={false} />);
    opener.focus();
    rerender(<Opened open />);
    await waitFor(() => {
      expect(root.querySelector('dialog')).not.toBeNull();
    });
  });

  it('opens inside the fullscreen element that holds the opener, and when nothing has focus', async () => {
    const fullscreen = document.body.appendChild(document.createElement('section'));
    const opener = fullscreen.appendChild(document.createElement('button'));
    Object.defineProperty(document, 'fullscreenElement', { configurable: true, get: () => fullscreen });
    try {
      opener.focus();
      const first = render(<Opened open />);
      await waitFor(() => {
        expect(fullscreen.querySelector('dialog')).not.toBeNull();
      });
      first.unmount();
      opener.blur();
      render(<Opened open />);
      await waitFor(() => {
        expect(fullscreen.querySelector('dialog')).not.toBeNull();
      });
    } finally {
      Reflect.deleteProperty(document, 'fullscreenElement');
    }
  });
});
