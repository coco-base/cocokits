// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode, useState, type ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Dialog } from '../index';
import { nextFrame, stubTopLayer } from './fixtures';

const { scrollLocks } = vi.hoisted(() => ({ scrollLocks: { locked: 0, unlocked: 0 } }));

vi.mock('@cocokits/cdk/scroll-lock', () => ({
  lockScroll: () => {
    scrollLocks.locked += 1;
    return () => {
      scrollLocks.unlocked += 1;
    };
  },
}));

beforeEach(() => {
  stubTopLayer();
  scrollLocks.locked = 0;
  scrollLocks.unlocked = 0;
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const button = (name: string): HTMLElement => screen.getByRole('button', { name });
const scrollLocked = (): boolean => scrollLocks.locked > scrollLocks.unlocked;
const dialogElement = (): HTMLDialogElement => {
  const found = document.querySelector<HTMLDialogElement>('dialog.cck-dialog__content');
  if (!found) throw new Error('no dialog');
  return found;
};

function Example({
  modal,
  onOpenChange,
  forceMount,
}: {
  readonly modal?: boolean;
  readonly onOpenChange?: (open: boolean, details: { reason: string; event: Event | null }) => void;
  readonly forceMount?: boolean;
}): ReactElement {
  return (
    <StrictMode>
      <button>before</button>
      <Dialog.Root modal={modal} onOpenChange={onOpenChange}>
        <Dialog.Trigger>Delete</Dialog.Trigger>
        <Dialog.Content forceMount={forceMount}>
          <Dialog.Title>Delete project</Dialog.Title>
          <input aria-label="field" />
          <Dialog.Close>Cancel</Dialog.Close>
        </Dialog.Content>
      </Dialog.Root>
      <button>after</button>
    </StrictMode>
  );
}

describe('Dialog modal', () => {
  it('is modal and locks the page by default', async () => {
    render(<Example />);
    await userEvent.click(button('Delete'));
    await screen.findByRole('dialog', { name: 'Delete project' });
    expect(dialogElement().hasAttribute('data-modal')).toBe(true);
    expect(scrollLocked()).toBe(true);
  });

  it('opens a native non-modal dialog without a lock when modal is false', async () => {
    render(<Example modal={false} />);
    await userEvent.click(button('Delete'));
    await screen.findByRole('dialog', { name: 'Delete project' });
    const dialog = dialogElement();
    expect(dialog.open).toBe(true);
    expect(dialog.hasAttribute('data-modal')).toBe(false);
    expect(dialog.hasAttribute('aria-modal')).toBe(false);
    expect(scrollLocked()).toBe(false);
    expect(document.querySelector('[inert]')).toBeNull();
  });

  it('closes a non-modal dialog on Escape and returns focus to the trigger', async () => {
    const onOpenChange = vi.fn();
    render(<Example modal={false} onOpenChange={onOpenChange} />);
    await userEvent.click(button('Delete'));
    await screen.findByRole('dialog');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    expect(onOpenChange).toHaveBeenLastCalledWith(false, expect.objectContaining({ reason: 'escape' }));
    await nextFrame();
    await nextFrame();
    expect(document.activeElement).toBe(button('Delete'));
  });

  it('closes a non-modal dialog on an outside press and leaves focus where the user put it', async () => {
    const onOpenChange = vi.fn();
    render(<Example modal={false} onOpenChange={onOpenChange} />);
    await userEvent.click(button('Delete'));
    await screen.findByRole('dialog');
    await userEvent.click(button('after'));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    expect(onOpenChange).toHaveBeenLastCalledWith(false, expect.objectContaining({ reason: 'outside-press' }));
    await nextFrame();
    await nextFrame();
    expect(document.activeElement).toBe(button('after'));
  });

  it('can refuse the outside press', async () => {
    function Refusing(): ReactElement {
      return (
        <>
          <button>after</button>
          <Dialog.Root modal={false}>
            <Dialog.Trigger>Delete</Dialog.Trigger>
            <Dialog.Content
              aria-label="x"
              onInteractOutside={(event) => {
                event.preventDefault();
              }}
            >
              text
            </Dialog.Content>
          </Dialog.Root>
        </>
      );
    }
    render(<Refusing />);
    await userEvent.click(button('Delete'));
    await screen.findByRole('dialog');
    await userEvent.click(button('after'));
    await nextFrame();
    expect(screen.queryByRole('dialog')).not.toBeNull();
  });

  it('closes a non-modal dialog when focus moves to an outside element', async () => {
    const onOpenChange = vi.fn();
    render(<Example modal={false} onOpenChange={onOpenChange} />);
    await userEvent.click(button('Delete'));
    await screen.findByRole('dialog');
    button('after').focus();
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    expect(onOpenChange).toHaveBeenLastCalledWith(false, expect.objectContaining({ reason: 'outside-press' }));
  });

  it('toggles on a press on the trigger, which is not an outside press', async () => {
    const onOpenChange = vi.fn();
    render(<Example modal={false} onOpenChange={onOpenChange} />);
    await userEvent.click(button('Delete'));
    await screen.findByRole('dialog');
    await userEvent.click(button('Delete'));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    expect(onOpenChange.mock.calls.map((call: unknown[]) => [call[0], (call[1] as { reason: string }).reason])).toEqual(
      [
        [true, 'trigger'],
        [false, 'close'],
      ],
    );
  });

  it('keeps the value it opened with when modal changes while open', async () => {
    function Switch(): ReactElement {
      const [modal, setModal] = useState(false);
      return (
        <Dialog.Root modal={modal}>
          <Dialog.Trigger>Delete</Dialog.Trigger>
          <Dialog.Content aria-label="x">
            <button
              onClick={() => {
                setModal(true);
              }}
            >
              switch
            </button>
          </Dialog.Content>
        </Dialog.Root>
      );
    }
    render(<Switch />);
    await userEvent.click(button('Delete'));
    await userEvent.click(await screen.findByRole('button', { name: 'switch' }));
    expect(dialogElement().hasAttribute('data-modal')).toBe(false);
    expect(scrollLocked()).toBe(false);
  });
});

describe('Dialog forceMount', () => {
  it('keeps the closed dialog in the document, not open, and without a lock or a layer', async () => {
    render(<Example forceMount />);
    const dialog = await waitFor(dialogElement);
    expect(dialog.open).toBe(false);
    expect(dialog.getAttribute('data-state')).toBe('closed');
    expect(scrollLocked()).toBe(false);
    expect(button('Delete').getAttribute('aria-controls')).toBe(dialog.id);
    await userEvent.keyboard('{Escape}');
    expect(dialog.open).toBe(false);
  });

  it('opens the same element, keeps its inner state across open and close, and closes it natively', async () => {
    render(<Example forceMount />);
    const dialog = await waitFor(dialogElement);
    const field = dialog.querySelector('input');
    await userEvent.click(button('Delete'));
    await waitFor(() => {
      expect(dialog.open).toBe(true);
    });
    expect(dialog.getAttribute('data-state')).toBe('open');
    expect(scrollLocked()).toBe(true);
    await userEvent.type(screen.getByLabelText('field'), 'abc');
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => {
      expect(dialog.open).toBe(false);
    });
    expect(scrollLocked()).toBe(false);
    expect(dialogElement()).toBe(dialog);
    expect(dialog.querySelector('input')).toBe(field);
    expect(field?.value).toBe('abc');
    await nextFrame();
    await nextFrame();
    expect(document.activeElement).toBe(button('Delete'));
  });

  it('can open again after it closed', async () => {
    render(<Example forceMount />);
    const dialog = await waitFor(dialogElement);
    for (let round = 0; round < 2; round += 1) {
      await userEvent.click(button('Delete'));
      await waitFor(() => {
        expect(dialog.open).toBe(true);
      });
      await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      await waitFor(() => {
        expect(dialog.open).toBe(false);
      });
    }
    expect(scrollLocks.locked).toBe(2);
    expect(scrollLocks.unlocked).toBe(2);
  });
});
