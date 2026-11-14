import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { CckPopoverImports } from '../index';
import { stubOverlayApis } from './overlay-stubs';

const imports = [...CckPopoverImports];

describe('Popover accessibility', () => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('has no axe violations closed or open, checked on the whole document', async () => {
    const user = userEvent.setup();
    await render(
      `<ng-container cckPopover>
        <button cckPopoverTrigger>Share</button>
        <ng-template cckPopoverPortal>
          <cck-popover-content aria-label="Share this page"><p>Copy the link.</p><button cckPopoverClose>Close</button></cck-popover-content>
        </ng-template>
      </ng-container>`,
      { imports },
    );
    expect((await axe(document.body)).violations).toEqual([]);
    await user.click(screen.getByRole('button', { name: 'Share' }));
    await screen.findByRole('dialog', { name: 'Share this page' });
    expect((await axe(document.body)).violations).toEqual([]);
  });

  it('is named by aria-labelledby when the author points it at a heading', async () => {
    const user = userEvent.setup();
    await render(
      `<ng-container cckPopover>
        <button cckPopoverTrigger>Open</button>
        <ng-template cckPopoverPortal>
          <cck-popover-content aria-labelledby="t"><h2 id="t">Settings</h2><button cckPopoverClose>Done</button></cck-popover-content>
        </ng-template>
      </ng-container>`,
      { imports },
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(await screen.findByRole('dialog', { name: 'Settings' })).toBeTruthy();
    expect((await axe(document.body)).violations).toEqual([]);
  });
});
