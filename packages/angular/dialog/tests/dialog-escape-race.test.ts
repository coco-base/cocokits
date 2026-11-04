import { Component, signal } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckDialogImports, type DialogChangeDetails } from '../index';
import { stubOverlayApis } from './overlay-stubs';

@Component({
  imports: [...CckDialogImports],
  template: `
    <ng-container
      cckDialog
      [(open)]="open"
      (opened)="details.push({ ...$event, value: true })"
      (closed)="details.push({ ...$event, value: false })"
    >
      <button cckDialogTrigger>Delete</button>
      <ng-template cckDialogPortal>
        <dialog cckDialogContent aria-label="Delete project">Text</dialog>
      </ng-template>
    </ng-container>
  `,
})
class Host {
  readonly open = signal(false);
  readonly details: (DialogChangeDetails & { value: boolean })[] = [];
}

describe('Dialog Escape right after the opening click', () => {
  beforeEach(() => {
    stubOverlayApis();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('closes when Escape comes in the same task as the click, before the content has rendered', async () => {
    const { fixture } = await render(Host);
    const host = fixture.componentInstance;
    const trigger = screen.getByRole('button', { name: 'Delete' });
    trigger.click();
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    await fixture.whenStable();
    await waitFor(() => {
      expect(document.querySelector('dialog')).toBeNull();
    });
    expect(host.open()).toBe(false);
    expect(host.details.map((details) => details.reason)).toEqual(['trigger', 'escape']);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });
});
