import { Component, input, type TemplateRef } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { CckTooltipImports } from '@cocokits/angular/tooltip';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckDialogImports } from '../index';
import { stubOverlayApis } from './overlay-stubs';

/** Root inputs written as static attributes on the trigger. */
const STATIC = `
  <button
    [cckDialogTriggerFor]="confirm"
    role="alertdialog"
    autoFocus="dialog"
    width="40rem"
    maxHeight="80vh"
    restoreFocus="false"
    closeOnNavigation="false"
    disableClose
  >Delete</button>
  <ng-template #confirm>
    <dialog cckDialogContent aria-label="Confirm delete"><button cckDialogClose>Cancel</button></dialog>
  </ng-template>`;

/** The trigger in a child component; the template comes from the parent. */
@Component({
  selector: 'child-trigger',
  imports: [...CckDialogImports],
  template: `<button [cckDialogTriggerFor]="template()">Open from child</button>`,
})
class ChildTrigger {
  readonly template = input.required<TemplateRef<unknown>>();
}

describe('Dialog trigger with a template', () => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sets the dialog from static root attributes and leaves none of them on the button', async () => {
    const user = userEvent.setup();
    await render(STATIC, { imports: [...CckDialogImports] });
    const trigger = screen.getByRole('button', { name: 'Delete' });
    for (const name of [
      'role',
      'autofocus',
      'width',
      'maxheight',
      'restorefocus',
      'closeonnavigation',
      'disableclose',
    ]) {
      expect(trigger.hasAttribute(name)).toBe(false);
    }
    await user.click(trigger);
    const dialog = await screen.findByRole('alertdialog', { name: 'Confirm delete' });
    expect(dialog.style.width).toBe('40rem');
    expect(dialog.style.maxHeight).toBe('80vh');
    expect(dialog.hasAttribute('autofocus')).toBe(true);
    await user.keyboard('{Escape}');
    expect(screen.getByRole('alertdialog', { name: 'Confirm delete' })).toBe(dialog);
  });

  it('opens a template declared in a parent from a trigger in a child', async () => {
    const user = userEvent.setup();
    await render(
      `<child-trigger [template]="notes" />
      <ng-template #notes><dialog cckDialogContent aria-label="Notes">Text</dialog></ng-template>`,
      { imports: [...CckDialogImports, ChildTrigger] },
    );
    await user.click(screen.getByRole('button', { name: 'Open from child' }));
    expect(await screen.findByRole('dialog', { name: 'Notes' })).toBeTruthy();
  });

  it('leaves the id and data-state of the trigger to the dialog when a tooltip sits on the same button', async () => {
    const user = userEvent.setup();
    await render(
      `<button [cckDialogTriggerFor]="remove" cckTooltip="Remove the member">Remove</button>
      <ng-template #remove><dialog cckDialogContent aria-label="Remove member">Text</dialog></ng-template>`,
      { imports: [...CckDialogImports, ...CckTooltipImports] },
    );
    const trigger = screen.getByRole('button', { name: 'Remove' });
    const id = trigger.id;
    expect(id).toMatch(/^cck-dialog-/);
    expect(trigger.getAttribute('data-state')).toBe('closed');
    await user.tab();
    await waitFor(() => {
      expect(document.getElementById(trigger.getAttribute('aria-describedby') ?? '')?.textContent.trim()).toBe(
        'Remove the member',
      );
    });
    expect(trigger.id).toBe(id);
    expect(trigger.getAttribute('data-state')).toBe('closed');
    await user.click(trigger);
    const dialog = await screen.findByRole('dialog', { name: 'Remove member' });
    expect(trigger.getAttribute('aria-controls')).toBe(dialog.id);
    expect(trigger.getAttribute('data-state')).toBe('open');
    expect(trigger.id).toBe(id);
  });
});
