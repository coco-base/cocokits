import { Component, signal } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckPopoverImports } from '../index';
import { stubOverlayApis } from './overlay-stubs';

@Component({
  imports: [...CckPopoverImports],
  template: `
    <ng-container cckPopover [open]="true">
      <button cckPopoverTrigger>Open</button>
      <ng-template cckPopoverPortal>
        <cck-popover-content>
          @if (titled()) {
            <h2 cckPopoverTitle>Settings</h2>
          }
          @if (described()) {
            <cck-popover-description>Change how it looks.</cck-popover-description>
          }
        </cck-popover-content>
      </ng-template>
    </ng-container>
  `,
})
class Host {
  readonly titled = signal(true);
  readonly described = signal(true);
}

describe('Popover title and description', () => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('names and describes the content, and does not warn for a content named by its title', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await render(Host);
    const dialog = await screen.findByRole('dialog', { name: 'Settings', description: 'Change how it looks.' });
    const title = screen.getByRole('heading', { name: 'Settings' });
    expect(title.className).toBe('cck-popover__title');
    expect(dialog.getAttribute('aria-labelledby')).toBe(title.id);
    expect(screen.getByText('Change how it looks.').className).toBe('cck-popover__description');
    expect(warn).not.toHaveBeenCalled();
  });

  it('removes the attributes when the parts unmount', async () => {
    const { fixture } = await render(Host);
    const dialog = await screen.findByRole('dialog');
    fixture.componentInstance.titled.set(false);
    fixture.componentInstance.described.set(false);
    await fixture.whenStable();
    await waitFor(() => {
      expect(dialog.hasAttribute('aria-labelledby')).toBe(false);
    });
    expect(dialog.hasAttribute('aria-describedby')).toBe(false);
  });

  it('warns once, naming the title, for an unnamed content', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await render(
      `<ng-container cckPopover [open]="true">
        <button cckPopoverTrigger>Open</button>
        <ng-template cckPopoverPortal><cck-popover-content>Unnamed</cck-popover-content></ng-template>
      </ng-container>`,
      { imports: [...CckPopoverImports] },
    );
    await waitFor(() => {
      expect(warn).toHaveBeenCalledTimes(1);
    });
    expect(String(warn.mock.calls[0]?.[0])).toContain('Add a cckPopoverTitle, or an aria-label or aria-labelledby');
  });
});
