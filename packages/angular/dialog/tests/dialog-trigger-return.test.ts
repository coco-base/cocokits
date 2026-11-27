import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckDialogImports } from '../index';
import { stubOverlayApis } from './overlay-stubs';

const imports = [...CckDialogImports];

/** The inner Trigger is pressed by a script `click()`, which (as in Safari) does not focus it. */
const NESTED = `
  <button [cckDialogTriggerFor]="dialog">Outer</button>
  <ng-template #dialog>
    <dialog cckDialogContent aria-label="Outer dialog">
      <input aria-label="Name" />
      <button [cckDialogTriggerFor]="dialog2">Inner</button>
      <ng-template #dialog2>
        <dialog cckDialogContent aria-label="Inner dialog"><button cckDialogClose>Done</button></dialog>
      </ng-template>
    </dialog>
  </ng-template>`;

const gone = (name: string): Promise<void> =>
  waitFor(() => {
    expect(screen.queryByRole('dialog', { name })).toBeNull();
  });

describe('Dialog focus return to the Trigger', () => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns focus to the Trigger that opened it, not to the control that had focus, on Escape', async () => {
    const user = userEvent.setup();
    await render(NESTED, { imports });
    await user.click(screen.getByRole('button', { name: 'Outer' }));
    await screen.findByRole('dialog', { name: 'Outer dialog' });
    screen.getByRole('textbox', { name: 'Name' }).focus();
    screen.getByRole('button', { name: 'Inner' }).click();
    await screen.findByRole('dialog', { name: 'Inner dialog' });
    await user.keyboard('{Escape}');
    await gone('Inner dialog');
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Inner' }));
    });
  });

  it('returns focus to the Trigger that opened it on Close', async () => {
    const user = userEvent.setup();
    await render(NESTED, { imports });
    await user.click(screen.getByRole('button', { name: 'Outer' }));
    await screen.findByRole('dialog', { name: 'Outer dialog' });
    screen.getByRole('textbox', { name: 'Name' }).focus();
    screen.getByRole('button', { name: 'Inner' }).click();
    await screen.findByRole('dialog', { name: 'Inner dialog' });
    await user.click(screen.getByRole('button', { name: 'Done' }));
    await gone('Inner dialog');
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Inner' }));
    });
  });
});
