import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { CckDialogImports } from '@cocokits/angular/dialog';
import { CckPopoverImports } from '@cocokits/angular/popover';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckMenuImports } from '../index';
import { stubOverlayApis } from './overlay-stubs';
import { frame, item, trigger } from './queries';

const imports = [...CckMenuImports, ...CckPopoverImports, ...CckDialogImports];

describe('Menu layers', () => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Escape in a menu inside a Popover closes only the menu, then the next Escape closes the Popover', async () => {
    const user = userEvent.setup();
    await render(
      `<ng-container cckPopover>
        <button cckPopoverTrigger>Panel</button>
        <ng-template cckPopoverPortal>
          <cck-popover-content aria-label="Panel">
            <ng-container cckMenu>
              <button cckMenuTrigger>Actions</button>
              <ng-template cckMenuPortal>
                <cck-menu-content><cck-menu-item>Edit</cck-menu-item></cck-menu-content>
              </ng-template>
            </ng-container>
          </cck-popover-content>
        </ng-template>
      </ng-container>`,
      { imports },
    );
    await user.click(screen.getByRole('button', { name: 'Panel' }));
    await screen.findByRole('dialog', { name: 'Panel' });
    await user.click(trigger());
    await screen.findByRole('menu');
    await waitFor(() => {
      expect(document.activeElement).toBe(item('Edit'));
    });
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('menu')).toBeNull();
    });
    expect(screen.queryByRole('dialog', { name: 'Panel' })).not.toBeNull();
    await waitFor(() => {
      expect(document.activeElement).toBe(trigger());
    });
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Panel' })).toBeNull();
    });
  });

  it('a press inside the Popover that holds the trigger closes the menu and leaves the Popover open', async () => {
    const user = userEvent.setup();
    await render(
      `<ng-container cckPopover [open]="true">
        <button cckPopoverTrigger>Panel</button>
        <ng-template cckPopoverPortal>
          <cck-popover-content aria-label="Panel">
            <p>Text</p>
            <ng-container cckMenu>
              <button cckMenuTrigger>Actions</button>
              <ng-template cckMenuPortal>
                <cck-menu-content><cck-menu-item>Edit</cck-menu-item></cck-menu-content>
              </ng-template>
            </ng-container>
          </cck-popover-content>
        </ng-template>
      </ng-container>`,
      { imports },
    );
    await screen.findByRole('dialog', { name: 'Panel' });
    await user.click(trigger());
    await screen.findByRole('menu');
    await user.click(screen.getByText('Text'));
    await waitFor(() => {
      expect(screen.queryByRole('menu')).toBeNull();
    });
    expect(screen.queryByRole('dialog', { name: 'Panel' })).not.toBeNull();
  });

  it('inside a modal Dialog the menu renders in the dialog, is not inert, and a run keeps the dialog open', async () => {
    const user = userEvent.setup();
    const log: string[] = [];
    await render(
      `<ng-container cckDialog>
        <button cckDialogTrigger>Edit profile</button>
        <ng-template cckDialogPortal>
          <dialog cckDialogContent aria-label="Profile">
            <ng-container cckMenu>
              <button cckMenuTrigger>Actions</button>
              <ng-template cckMenuPortal>
                <cck-menu-content>
                  <cck-menu-item (triggered)="log.push('Edit')">Edit</cck-menu-item>
                </cck-menu-content>
              </ng-template>
            </ng-container>
            <button cckDialogClose>Cancel</button>
          </dialog>
        </ng-template>
      </ng-container>`,
      { imports, componentProperties: { log } },
    );
    await user.click(screen.getByRole('button', { name: 'Edit profile' }));
    const dialog = await waitFor(() => {
      const found = document.querySelector('dialog[open]');
      if (!found) throw new Error('The dialog is not open yet.');
      return found;
    });
    await user.click(trigger());
    const menu = await screen.findByRole('menu');
    expect(dialog.contains(menu)).toBe(true);
    expect(menu.closest('[inert]')).toBeNull();
    await waitFor(() => {
      expect(document.activeElement).toBe(item('Edit'));
    });
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('menu')).toBeNull();
    });
    expect(document.querySelector('dialog[open]')).toBe(dialog);
    await user.click(trigger());
    await user.click(await screen.findByRole('menuitem', { name: 'Edit' }));
    await waitFor(() => {
      expect(screen.queryByRole('menu')).toBeNull();
    });
    await frame();
    expect(log).toEqual(['Edit']);
    expect(document.querySelector('dialog[open]')).toBe(dialog);
  });
});
