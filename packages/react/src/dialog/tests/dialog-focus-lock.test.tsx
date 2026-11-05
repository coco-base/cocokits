// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode, type ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Popover } from '../../popover';
import { Dialog } from '../index';
import { boxAt, button, closed, content, Example, nextFrame, pressOn, stubTopLayer, trigger } from './fixtures';

beforeEach(stubTopLayer);

afterEach(() => {
  cleanup();
  Reflect.deleteProperty(HTMLElement.prototype, 'getAnimations');
  vi.restoreAllMocks();
  document.body.innerHTML = '';
  document.documentElement.removeAttribute('style');
});

type User = ReturnType<typeof userEvent.setup>;

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
