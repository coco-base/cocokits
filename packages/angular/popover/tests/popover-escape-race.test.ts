import { Component, signal } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import { beforeEach, describe, expect, it } from 'vitest';
import { CckPopoverImports, type PopoverChangeDetails } from '../index';
import { stubOverlayApis } from './overlay-stubs';

@Component({
  imports: [...CckPopoverImports],
  template: `
    <ng-container
      cckPopover
      [(open)]="open"
      (opened)="details.push({ ...$event, value: true })"
      (closed)="details.push({ ...$event, value: false })"
    >
      <button cckPopoverTrigger>Share</button>
      <ng-template cckPopoverPortal>
        <div cckPopoverContent aria-label="Share this page">Text</div>
      </ng-template>
    </ng-container>
  `,
})
class Host {
  readonly open = signal(false);
  readonly details: (PopoverChangeDetails & { value: boolean })[] = [];
}

describe('Popover Escape right after the opening click', () => {
  beforeEach(() => {
    stubOverlayApis();
  });

  it('closes when Escape comes in the same task as the click, before the content has rendered', async () => {
    const { fixture } = await render(Host);
    const host = fixture.componentInstance;
    const trigger = screen.getByRole('button', { name: 'Share' });
    trigger.click();
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    await fixture.whenStable();
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    expect(host.open()).toBe(false);
    expect(host.details.map((details) => details.reason)).toEqual(['trigger', 'escape']);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });
});
