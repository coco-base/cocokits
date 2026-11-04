import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { CckTooltipImports } from '../index';
import { stubOverlayApis } from './overlay-stubs';

// A tooltip is no landmark: the page-level `region` rule asks for a landmark around every text outside one,
// which a component test without a page cannot have. Every other rule runs.
const noPageLandmarks = { rules: { region: { enabled: false } } };

describe('Tooltip accessibility', () => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('has no axe violations closed or open, and describes the trigger by the tooltip', async () => {
    const user = userEvent.setup();
    await render(
      `<ng-container cckTooltip>
        <button cckTooltipTrigger aria-label="Copy link">Copy</button>
        <ng-template cckTooltipPortal><div cckTooltipContent>Copies the link to the clipboard</div></ng-template>
      </ng-container>`,
      { imports: [...CckTooltipImports] },
    );
    expect((await axe(document.body, noPageLandmarks)).violations).toEqual([]);
    await user.tab();
    const tip = await screen.findByRole('tooltip');
    expect(screen.getByRole('button', { name: 'Copy link' }).getAttribute('aria-describedby')).toBe(tip.id);
    expect(tip.textContent).toBe('Copies the link to the clipboard');
    expect((await axe(document.body, noPageLandmarks)).violations).toEqual([]);
  });

  it('has no axe violations for the one-attribute form, and the trigger is described while closed and open', async () => {
    const user = userEvent.setup();
    await render(`<button cckTooltip="Copies the link to the clipboard">Copy</button>`, {
      imports: [...CckTooltipImports],
    });
    const trigger = screen.getByRole('button', { name: 'Copy' });
    const description = document.querySelector('[role="tooltip"][hidden]');
    expect(description?.id).toBe(trigger.getAttribute('aria-describedby'));
    expect(description?.textContent).toBe('Copies the link to the clipboard');
    expect((await axe(document.body, noPageLandmarks)).violations).toEqual([]);
    await user.tab();
    await waitFor(() => {
      expect(document.querySelector('.cck-tooltip__content')).not.toBeNull();
    });
    expect(trigger.getAttribute('aria-describedby')).toBe(description?.id);
    expect((await axe(document.body, noPageLandmarks)).violations).toEqual([]);
  });
});
