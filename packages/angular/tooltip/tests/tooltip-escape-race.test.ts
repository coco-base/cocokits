import { Component } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import { beforeEach, describe, expect, it } from 'vitest';
import { CckTooltipImports } from '../index';
import { stubOverlayApis } from './overlay-stubs';

@Component({
  imports: [...CckTooltipImports],
  template: `
    <ng-container cckTooltip>
      <button cckTooltipTrigger aria-label="Copy link">Copy</button>
      <ng-template cckTooltipPortal><cck-tooltip-content>Copy the link</cck-tooltip-content></ng-template>
    </ng-container>
  `,
})
class Host {
  protected readonly ready = true;
}

describe('Tooltip Escape right after the focus that opened it', () => {
  beforeEach(() => {
    stubOverlayApis();
  });

  it('hides when Escape comes in the same task as the keyboard focus, before the content has rendered', async () => {
    const { fixture } = await render(Host);
    const trigger = screen.getByRole('button', { name: 'Copy link' });
    // A key press makes the next focus a keyboard focus (focus-visible), as Tab does.
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    trigger.focus();
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    await fixture.whenStable();
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).toBeNull();
    });
    expect(trigger.getAttribute('data-state')).toBe('closed');
    expect(trigger.hasAttribute('aria-describedby')).toBe(false);
  });
});
