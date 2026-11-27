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
    <button [cckTooltipTriggerFor]="richTip" [cckTooltipDisableClose]="disableClose()" aria-label="Copy link">
      Copy
    </button>
    <ng-template #richTip><cck-tooltip-content>Copy the link</cck-tooltip-content></ng-template>
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

describe('Tooltip cckTooltipDisableClose', () => {
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
});
