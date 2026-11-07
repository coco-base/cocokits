import { Component, afterNextRender, signal, viewChild } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckTooltip, CckTooltipImports } from '../index';
import { stubOverlayApis } from './overlay-stubs';

@Component({
  imports: [...CckTooltipImports],
  template: `
    <p>Empty space</p>
    <ng-container cckTooltip [disableClose]="disableClose()">
      <button cckTooltipTrigger aria-label="Copy link">Copy</button>
      <ng-template cckTooltipPortal><div cckTooltipContent>Copy the link</div></ng-template>
    </ng-container>
  `,
})
class Host {
  readonly tooltip = viewChild.required(CckTooltip);
  readonly disableClose = signal(true);

  constructor() {
    afterNextRender(() => {
      this.tooltip().show(0);
    });
  }
}

describe('Tooltip disableClose', () => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('keeps it shown on Escape and an outside press, and closes on Escape without it', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(Host);
    await screen.findByRole('tooltip');
    await user.keyboard('{Escape}');
    await user.click(screen.getByText('Empty space'));
    await fixture.whenStable();
    expect(screen.queryByRole('tooltip')).not.toBeNull();
    fixture.componentInstance.disableClose.set(false);
    await fixture.whenStable();
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).toBeNull();
    });
  });

  it('warns in development when the portal has no trigger', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await render(
      `<ng-container cckTooltip><ng-template cckTooltipPortal><div cckTooltipContent>x</div></ng-template></ng-container>`,
      { imports: [...CckTooltipImports] },
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('CocoKits: a TooltipPortal has no TooltipTrigger'));
  });
});
