import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { dialogMeta } from '@cocokits/machines/dialog';
import { CckDialogImports } from '../index';
import { stubOverlayApis } from './overlay-stubs';

const imports = [...CckDialogImports];

describe('Dialog accessibility', () => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
    document.documentElement.removeAttribute('style');
  });

  it('has no axe violations closed or open, checked on the whole document', async () => {
    const user = userEvent.setup();
    await render(
      `<ng-container cckDialog>
        <button cckDialogTrigger>Delete</button>
        <ng-template cckDialogPortal>
          <dialog cckDialogContent>
            <h2 cckDialogTitle>Delete project</h2>
            <p cckDialogDescription>This cannot be undone.</p>
            <button cckDialogClose>Cancel</button>
          </dialog>
        </ng-template>
      </ng-container>`,
      { imports },
    );
    expect((await axe(document.body)).violations).toEqual([]);
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await screen.findByRole('dialog', { name: 'Delete project' });
    expect((await axe(document.body)).violations).toEqual([]);
  });

  it('is a native dialog named by its Title and described by its Description (APG modal dialog)', async () => {
    const user = userEvent.setup();
    await render(
      `<ng-container cckDialog>
        <button cckDialogTrigger>Open</button>
        <ng-template cckDialogPortal>
          <dialog cckDialogContent><h2 cckDialogTitle>Settings</h2><p cckDialogDescription>Change things.</p></dialog>
        </ng-template>
      </ng-container>`,
      { imports },
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    const dialog = await screen.findByRole('dialog', { name: 'Settings', description: 'Change things.' });
    expect(dialog.localName).toBe(dialogMeta.defaultElements?.content);
    expect(dialogMeta.roles.content).toBeNull();
    expect(dialog.hasAttribute('role')).toBe(false);
  });

  it('is named by aria-label when it has no Title', async () => {
    const user = userEvent.setup();
    await render(
      `<ng-container cckDialog>
        <button cckDialogTrigger>Open</button>
        <ng-template cckDialogPortal><dialog cckDialogContent aria-label="Quick note">Text</dialog></ng-template>
      </ng-container>`,
      { imports },
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(await screen.findByRole('dialog', { name: 'Quick note' })).toBeTruthy();
    expect((await axe(document.body)).violations).toEqual([]);
  });
});
