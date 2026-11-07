// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import type { ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Dialog } from '../index';
import { stubTopLayer } from './fixtures';

beforeEach(stubTopLayer);
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

function Example(): ReactElement {
  return (
    <Dialog.Root>
      <Dialog.Trigger>Delete</Dialog.Trigger>
      <Dialog.Content forceMount>
        <Dialog.Title>Delete project</Dialog.Title>
        <Dialog.Close>Cancel</Dialog.Close>
      </Dialog.Content>
    </Dialog.Root>
  );
}

describe('Dialog forceMount hydration', () => {
  it('hydrates without a mismatch, then mounts the closed dialog, which opens on a click', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const container = document.body.appendChild(document.createElement('div'));
    container.innerHTML = renderToString(<Example />);
    expect(container.innerHTML).not.toContain('<dialog');
    render(<Example />, { container, hydrate: true });
    expect(error).not.toHaveBeenCalled();

    const dialog = await waitFor(() => {
      const found = document.querySelector<HTMLDialogElement>('dialog.cck-dialog__content');
      if (!found) throw new Error('not mounted');
      return found;
    });
    expect(dialog.open).toBe(false);
    expect(container.contains(dialog)).toBe(false);

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await waitFor(() => {
      expect(dialog.open).toBe(true);
    });
  });
});
