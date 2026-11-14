import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { popoverAnatomy, popoverMeta } from '@cocokits/machines/popover';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckPopoverImports } from '../index';
import { stubOverlayApis } from './overlay-stubs';

describe('Popover data attributes', () => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('only emits data-* declared in the meta, on every part', async () => {
    const user = userEvent.setup();
    await render(
      `<ng-container cckPopover>
        <button cckPopoverTrigger>Share</button>
        <ng-template cckPopoverPortal>
          <cck-popover-content aria-label="Share"><button cckPopoverClose>Close</button></cck-popover-content>
        </ng-template>
      </ng-container>`,
      { imports: [...CckPopoverImports] },
    );
    await user.click(screen.getByRole('button', { name: 'Share' }));
    await screen.findByRole('dialog');
    const declared: Readonly<Record<string, readonly string[]>> = popoverMeta.dataAttrs;
    let checked = 0;
    for (const [part, allowed] of Object.entries(declared)) {
      for (const el of document.querySelectorAll(`.${(popoverAnatomy.classes as Record<string, string>)[part]}`)) {
        const names = Array.from(el.attributes, (a) => a.name).filter((n) => n.startsWith('data-'));
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
