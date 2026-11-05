// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Dialog } from '../index';
import { button, closed, Example, stubTopLayer, trigger } from './fixtures';

beforeEach(stubTopLayer);
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
  document.documentElement.removeAttribute('style');
});

type User = ReturnType<typeof userEvent.setup>;

describe('Dialog focus return to the trigger', () => {
  // Safari does not focus a button on a press: the click arrives while focus sits on another control.
  it.each([
    ['Escape', async (user: User) => user.keyboard('{Escape}')],
    ['Close', async (user: User) => user.click(button('Cancel'))],
  ] as const)('returns to the trigger on %s when the press did not focus it', async (_name, perform) => {
    const user = userEvent.setup();
    render(<Example />);
    const other = button('before');
    other.focus();
    fireEvent.click(trigger());
    await screen.findByRole('dialog');
    await perform(user);
    await closed();
    await waitFor(() => {
      expect(document.activeElement).toBe(trigger());
    });
  });

  it('returns to the opener of a dialog with no trigger', async () => {
    const user = userEvent.setup();
    function Controlled(): ReactElement {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button
            onClick={() => {
              setOpen(true);
            }}
          >
            Open from code
          </button>
          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Content aria-label="Coded">
              <Dialog.Close>Cancel</Dialog.Close>
            </Dialog.Content>
          </Dialog.Root>
        </>
      );
    }
    render(<Controlled />);
    button('Open from code').focus();
    fireEvent.click(button('Open from code'));
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    await closed();
    await waitFor(() => {
      expect(document.activeElement).toBe(button('Open from code'));
    });
  });
});
