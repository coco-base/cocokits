import { Component, signal } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckDialogImports, type DialogChangeDetails } from '../index';
import { stubOverlayApis } from './overlay-stubs';
import { boxAt, closed, dialog, pressBackdrop } from './queries';

const DELETE = `
  <ng-container cckDialog [disableClose]="true" [(open)]="open" (opened)="details.push({ ...$event, value: true })" (closed)="details.push({ ...$event, value: false })">
    <button cckDialogTrigger>Delete</button>
    <ng-template cckDialogPortal>
      <dialog cckDialogContent>
        <h2 cckDialogTitle>Delete project</h2>
        <cck-dialog-description>This cannot be undone.</cck-dialog-description>
        <a href="#x">First</a>
        <button cckDialogClose>Cancel</button>
      </dialog>
    </ng-template>
  </ng-container>`;

@Component({ imports: [...CckDialogImports], template: DELETE })
class LockedHost {
  readonly open = signal(false);
  readonly details: (DialogChangeDetails & { value: boolean })[] = [];
}

describe('Dialog disableClose', () => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('refuses Escape and a press on the backdrop, and the Close part still closes', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(LockedHost);
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    const element = dialog();
    boxAt(element);
    pressBackdrop(element, { clientX: 10, clientY: 10 });
    await fixture.whenStable();
    expect(screen.queryByRole('dialog')).not.toBeNull();
    expect(fixture.componentInstance.open()).toBe(true);
    expect(fixture.componentInstance.details.map((details) => details.reason)).toEqual(['trigger']);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    expect(fixture.componentInstance.details.at(-1)).toMatchObject({ value: false, reason: 'close' });
  });

  it('keeps focus, naming and a keyboard way out while it refuses, and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    await render(LockedHost);
    const opener = screen.getByRole('button', { name: 'Delete' });
    await user.click(opener);
    const element = await screen.findByRole('dialog', { name: 'Delete project' });
    const close = screen.getByRole('button', { name: 'Cancel' });
    close.focus();
    await user.keyboard('{Escape}');
    expect(document.activeElement).toBe(close);
    expect(element.isConnected).toBe(true);
    expect(element.getAttribute('aria-labelledby')).toBe(screen.getByText('Delete project').id);
    expect(element.getAttribute('aria-describedby')).toBe(screen.getByText('This cannot be undone.').id);
    expect(opener.getAttribute('aria-expanded')).toBe('true');
    await user.keyboard('{Enter}');
    await closed();
    await waitFor(() => {
      expect(document.activeElement).toBe(opener);
    });
  });
});
