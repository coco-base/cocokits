import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { tooltipAnatomy, tooltipMeta } from '@cocokits/machines/tooltip';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckTooltipImports } from '../index';
import { stubOverlayApis } from './overlay-stubs';

describe('Tooltip data attributes', () => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('only emits data-* declared in the meta, on every part', async () => {
    const user = userEvent.setup();
    await render(
      `<ng-container cckTooltip>
        <button cckTooltipTrigger>Copy</button>
        <ng-template cckTooltipPortal><cck-tooltip-content>Copies</cck-tooltip-content></ng-template>
      </ng-container>`,
      { imports: [...CckTooltipImports] },
    );
    await user.tab();
    await screen.findByRole('tooltip');
    const declared: Readonly<Record<string, readonly string[]>> = tooltipMeta.dataAttrs;
    let checked = 0;
    for (const [part, allowed] of Object.entries(declared)) {
      for (const el of document.querySelectorAll(`.${(tooltipAnatomy.classes as Record<string, string>)[part]}`)) {
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
