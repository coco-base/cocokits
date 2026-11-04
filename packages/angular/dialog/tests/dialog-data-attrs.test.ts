import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { dialogAnatomy, dialogMeta } from '@cocokits/machines/dialog';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckDialogImports } from '../index';
import { stubOverlayApis } from './overlay-stubs';

describe('Dialog data attributes', () => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('only emits data-* declared in the meta, on every part', async () => {
    const user = userEvent.setup();
    await render(
      `<ng-container cckDialog>
        <button cckDialogTrigger>Open</button>
        <ng-template cckDialogPortal>
          <dialog cckDialogContent>
            <h2 cckDialogTitle>Title</h2>
            <p cckDialogDescription>Text</p>
            <button cckDialogClose>Close</button>
          </dialog>
        </ng-template>
      </ng-container>`,
      { imports: [...CckDialogImports] },
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await screen.findByRole('dialog');
    const declared: Readonly<Record<string, readonly string[]>> = dialogMeta.dataAttrs;
    let checked = 0;
    for (const [part, allowed] of Object.entries(declared)) {
      for (const el of document.querySelectorAll(`.${(dialogAnatomy.classes as Record<string, string>)[part]}`)) {
        // `data-modal` is set by the jsdom stub of `showModal`, not by the component.
        const names = Array.from(el.attributes, (a) => a.name).filter(
          (n) => n.startsWith('data-') && n !== 'data-modal',
        );
        expect(
          names.filter((n) => !allowed.includes(n)),
          part,
        ).toEqual([]);
        checked++;
      }
    }
    expect(checked).toBeGreaterThan(1);
  });
});
