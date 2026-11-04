// @vitest-environment jsdom
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode, useState, type ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Popover } from '../../popover';
import { Dialog } from '../index';
import { nextFrame, pressOn, stubTopLayer } from './fixtures';

beforeEach(stubTopLayer);
afterEach(() => {
  cleanup();
  Reflect.deleteProperty(HTMLElement.prototype, 'getAnimations');
  vi.restoreAllMocks();
  document.body.innerHTML = '';
  document.documentElement.removeAttribute('style');
});

const button = (name: string): HTMLElement => screen.getByRole('button', { name });

/** A promise that stands in for the exit animation of an element. */
function animate(element: HTMLElement): () => Promise<void> {
  let finish: () => void = () => undefined;
  const finished = new Promise<void>((resolve) => {
    finish = resolve;
  });
  Object.defineProperty(element, 'getAnimations', {
    value: () => [
      {
        finished,
        animationName: 'exit',
        playState: 'running',
        effect: { getComputedTiming: () => ({ endTime: 300 }) },
      },
    ],
    configurable: true,
  });
  return async () => {
    await act(async () => {
      finish();
      await finished;
    });
  };
}

describe('A modal that exits', () => {
  it('keeps the page locked until its exit animation has finished', async () => {
    render(
      <StrictMode>
        <Dialog.Root>
          <Dialog.Trigger>Delete</Dialog.Trigger>
          <Dialog.Content>
            <Dialog.Title>Delete project</Dialog.Title>
            <Dialog.Close>Cancel</Dialog.Close>
          </Dialog.Content>
        </Dialog.Root>
      </StrictMode>,
    );
    await userEvent.click(button('Delete'));
    const dialog = await screen.findByRole('dialog', { name: 'Delete project' });
    const finish = animate(dialog);
    expect(document.documentElement.style.overflow).toBe('hidden');
    await userEvent.keyboard('{Escape}');
    await nextFrame();
    expect(dialog.getAttribute('data-state')).toBe('closed');
    expect(document.documentElement.style.overflow).toBe('hidden');
    await finish();
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    expect(document.documentElement.style.overflow).toBe('');
  });

  it('stays a barrier: Escape and a press during the exit reach no layer below', async () => {
    const onOuter = vi.fn();
    render(
      <StrictMode>
        <Dialog.Root onOpenChange={onOuter}>
          <Dialog.Trigger>Outer</Dialog.Trigger>
          <Dialog.Content aria-label="outer">
            <Dialog.Root>
              <Dialog.Trigger>Inner</Dialog.Trigger>
              <Dialog.Content>
                <Dialog.Title>Inner dialog</Dialog.Title>
                <Dialog.Close>Cancel</Dialog.Close>
              </Dialog.Content>
            </Dialog.Root>
          </Dialog.Content>
        </Dialog.Root>
      </StrictMode>,
    );
    await userEvent.click(button('Outer'));
    await userEvent.click(button('Inner'));
    const inner = await screen.findByRole('dialog', { name: 'Inner dialog' });
    const finish = animate(inner);
    await userEvent.keyboard('{Escape}');
    await nextFrame();
    expect(inner.getAttribute('data-state')).toBe('closed');

    await userEvent.keyboard('{Escape}');
    pressOn(document.body, { clientX: 5, clientY: 5 });
    expect(screen.getByRole('dialog', { name: 'outer' })).toBeTruthy();
    expect(onOuter).toHaveBeenCalledTimes(1);

    await finish();
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Inner dialog' })).toBeNull();
    });
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'outer' })).toBeNull();
    });
  });
});

describe('Dialog focus return to the opener', () => {
  function Controlled({ removable = false }: { readonly removable?: boolean }): ReactElement {
    const [open, setOpen] = useState(false);
    const [present, setPresent] = useState(true);
    return (
      <StrictMode>
        {present && (
          <button
            onClick={() => {
              setOpen(true);
            }}
          >
            Open it
          </button>
        )}
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger>Delete</Dialog.Trigger>
          <Dialog.Content>
            <Dialog.Title>Delete project</Dialog.Title>
            {removable && (
              <button
                onClick={() => {
                  setPresent(false);
                }}
              >
                Remove opener
              </button>
            )}
            <Dialog.Close>Cancel</Dialog.Close>
          </Dialog.Content>
        </Dialog.Root>
      </StrictMode>
    );
  }

  it('returns focus to the element that had it when the dialog opened, not to the Trigger', async () => {
    render(<Controlled />);
    await userEvent.click(button('Open it'));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeNull();
    });
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    await nextFrame();
    await nextFrame();
    expect(document.activeElement).toBe(button('Open it'));
  });

  it('falls back to the body of the document when the opener is gone', async () => {
    render(<Controlled removable />);
    await userEvent.click(button('Open it'));
    await userEvent.click(button('Remove opener'));
    expect(screen.queryByRole('button', { name: 'Open it' })).toBeNull();
    await userEvent.click(button('Cancel'));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    await nextFrame();
    await nextFrame();
    expect(document.activeElement).toBe(document.body);
  });
});

describe('A close the browser forced after a cancel with no key', () => {
  it('closes with reason escape once and does not show the dialog again', async () => {
    const onOpenChange = vi.fn<(open: boolean, details: { reason: string; event: Event | null }) => void>();
    render(
      <StrictMode>
        <Dialog.Root onOpenChange={onOpenChange}>
          <Dialog.Trigger>Delete</Dialog.Trigger>
          <Dialog.Content aria-label="Locked">
            <Dialog.Close>Cancel</Dialog.Close>
          </Dialog.Content>
        </Dialog.Root>
      </StrictMode>,
    );
    await userEvent.click(button('Delete'));
    const dialog = await screen.findByRole<HTMLDialogElement>('dialog', { name: 'Locked' });
    dialog.dispatchEvent(new Event('cancel', { cancelable: false }));
    dialog.close();
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    await nextFrame();
    expect(onOpenChange.mock.calls.map((call) => [call[0], call[1].reason])).toEqual([
      [true, 'trigger'],
      [false, 'escape'],
    ]);
  });
});

describe('Tab out of a popover inside a modal dialog', () => {
  it('goes to the next tabbable inside the dialog, never to the inert page', async () => {
    render(
      <StrictMode>
        <button>Outside</button>
        <Dialog.Root>
          <Dialog.Trigger>Delete</Dialog.Trigger>
          <Dialog.Content aria-label="d">
            <Popover.Root>
              <Popover.Trigger>More</Popover.Trigger>
              <Popover.Content aria-label="more">
                <button>Inside</button>
              </Popover.Content>
            </Popover.Root>
            <button>After popover</button>
          </Dialog.Content>
        </Dialog.Root>
      </StrictMode>,
    );
    await userEvent.click(button('Delete'));
    await userEvent.click(await screen.findByRole('button', { name: 'More' }));
    await waitFor(() => {
      expect(document.activeElement).toBe(button('Inside'));
    });
    await userEvent.tab();
    expect(document.activeElement).toBe(button('After popover'));
  });
});

describe('Shift+Tab out of a popover inside a modal dialog', () => {
  it('goes back to the trigger inside the dialog', async () => {
    render(
      <StrictMode>
        <button>Outside</button>
        <Dialog.Root>
          <Dialog.Trigger>Delete</Dialog.Trigger>
          <Dialog.Content aria-label="d">
            <Popover.Root>
              <Popover.Trigger>More</Popover.Trigger>
              <Popover.Content aria-label="more">
                <button>Inside</button>
              </Popover.Content>
            </Popover.Root>
            <button>After popover</button>
          </Dialog.Content>
        </Dialog.Root>
      </StrictMode>,
    );
    await userEvent.click(button('Delete'));
    await userEvent.click(await screen.findByRole('button', { name: 'More' }));
    await waitFor(() => {
      expect(document.activeElement).toBe(button('Inside'));
    });
    await userEvent.tab({ shift: true });
    expect(document.activeElement).toBe(button('More'));
  });
});

describe('Reopen during the exit', () => {
  it('still returns focus to the original opener after the final close', async () => {
    let reopen: () => void = () => undefined;
    function Controlled(): ReactElement {
      const [open, setOpen] = useState(false);
      reopen = () => {
        setOpen(true);
      };
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
            <Dialog.Trigger>Delete</Dialog.Trigger>
            <Dialog.Content aria-label="d">
              <Dialog.Close>Cancel</Dialog.Close>
            </Dialog.Content>
          </Dialog.Root>
        </StrictMode>
      );
    }
    render(<Controlled />);
    await userEvent.click(button('Open it'));
    const dialog = await screen.findByRole('dialog', { name: 'd' });
    const finish = animate(dialog);
    await userEvent.keyboard('{Escape}');
    await nextFrame();
    // Reopen from the page while focus is still inside the exiting dialog.
    act(() => {
      reopen();
    });
    await nextFrame();
    await userEvent.keyboard('{Escape}');
    await nextFrame();
    await finish();
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    await nextFrame();
    await nextFrame();
    expect(document.activeElement).toBe(button('Open it'));
  });
});
