import { Component, signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckDialogImports } from '../index';
import { stubOverlayApis } from './overlay-stubs';

@Component({
  imports: [...CckDialogImports],
  template: `
    <ng-container cckDialog [open]="startOpen">
      <button cckDialogTrigger id="mine">Delete</button>
      <ng-template cckDialogPortal>
        <dialog cckDialogContent aria-label="Delete project">Text</dialog>
      </ng-template>
    </ng-container>
  `,
})
class Host {
  protected readonly startOpen = true;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Dialog trigger id', () => {
  beforeEach(() => {
    stubOverlayApis();
  });

  it('keeps the id the author wrote and still links the trigger to the content', async () => {
    await render(Host);
    const trigger = screen.getByRole('button', { name: 'Delete' });
    const content = await screen.findByRole('dialog', { name: 'Delete project' });
    expect(trigger.id).toBe('mine');
    expect(trigger.getAttribute('aria-controls')).toBe(content.id);
    expect(content.id).not.toBe('');
  });
});

@Component({
  imports: [...CckDialogImports],
  template: `
    <ng-container cckDialog>
      <button cckDialogTrigger [id]="id()">Bound</button>
      <ng-template cckDialogPortal>
        <dialog cckDialogContent aria-label="Bound">Text</dialog>
      </ng-template>
    </ng-container>
  `,
})
class BoundHost {
  readonly id = signal<string | undefined>('first');
}

describe('Dialog trigger id input', () => {
  beforeEach(() => {
    stubOverlayApis();
  });

  it('wins over the generated id, follows changes and falls back to the generated one', async () => {
    const { fixture } = await render(BoundHost);
    const trigger = screen.getByRole('button', { name: 'Bound' });
    expect(trigger.id).toBe('first');
    fixture.componentInstance.id.set('second');
    await fixture.whenStable();
    expect(trigger.id).toBe('second');
    fixture.componentInstance.id.set(undefined);
    await fixture.whenStable();
    expect(trigger.id).toMatch(/^cck-dialog-.*-trigger$/);
  });
});
