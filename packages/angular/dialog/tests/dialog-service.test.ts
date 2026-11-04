import { Component, InjectionToken, Injector, TemplateRef, inject, viewChild } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { dialogAnatomy } from '@cocokits/machines/dialog';
import { firstValueFrom } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CCK_DIALOG_DATA, CckDialogImports, CckDialog, CckDialogRef } from '../index';
import { stubOverlayApis } from './overlay-stubs';
import { must } from './service-fixtures';

const FROM_INJECTOR = new InjectionToken<string>('FROM_INJECTOR');

interface Data {
  readonly name: string;
}

@Component({
  imports: [CckDialogImports],
  template: `
    <h2 cckDialogTitle>Hello {{ data.name }}</h2>
    <p id="from-injector">{{ fromInjector }}</p>
    <button [cckDialogClose]="'saved'">Save</button>
    <button cckDialogClose>Cancel</button>
    <button id="by-ref" (click)="ref.close(42)">By ref</button>
    <button id="nested" (click)="openNested()">Nested</button>
  `,
})
class Content {
  protected readonly data = inject(CCK_DIALOG_DATA) as Data;
  protected readonly fromInjector = inject(FROM_INJECTOR, { optional: true }) ?? 'none';
  protected readonly ref = inject(CckDialogRef);
  private readonly service = inject(CckDialog);

  protected openNested(): void {
    this.service.open(Content, { data: { name: 'inner' } });
  }
}

@Component({
  imports: [CckDialogImports],
  template: `
    <button id="opener" (click)="open()">Open</button>
    <ng-template #tpl let-data let-ref="dialogRef">
      <h2 cckDialogTitle>Template {{ data.name }}</h2>
      <button id="tpl-close" (click)="ref.close('from template')">Done</button>
    </ng-template>
  `,
})
class Host {
  readonly service = inject(CckDialog);
  readonly template = viewChild.required<TemplateRef<unknown>>('tpl');
  private readonly injector = inject(Injector);
  ref: CckDialogRef<Content, string | number> | null = null;

  open(): void {
    this.ref = this.service.open<Content, Data, string | number>(Content, {
      data: { name: 'Ada' },
      injector: Injector.create({ providers: [{ provide: FROM_INJECTOR, useValue: 'parent' }], parent: this.injector }),
    });
  }
}

const noDialog = (): Promise<void> =>
  waitFor(() => {
    expect(screen.queryByRole('dialog')).toBeNull();
  });

describe('CckDialog', () => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
    document.documentElement.removeAttribute('style');
  });

  it('opens a modal dialog with the component, its data and the injector it was given', async () => {
    const user = userEvent.setup();
    await render(Host);
    await user.click(screen.getByRole('button', { name: 'Open' }));
    const element = await screen.findByRole<HTMLDialogElement>('dialog', { name: 'Hello Ada' });
    expect(element.open).toBe(true);
    expect(element.classList.contains(dialogAnatomy.classes.content)).toBe(true);
    expect(element.matches(':modal')).toBe(true);
    expect(element.getAttribute('data-state')).toBe('open');
    expect(element.querySelector('#from-injector')?.textContent).toBe('parent');
    expect(screen.getByRole('button', { name: 'Save' }).classList.contains(dialogAnatomy.classes.close)).toBe(true);
    expect(document.documentElement.style.overflow).toBe('hidden');
  });

  describe('closed', () => {
    it('resolves with the value of a Close and undefined for a Close without one', async () => {
      const user = userEvent.setup();
      const { fixture } = await render(Host);
      await user.click(screen.getByRole('button', { name: 'Open' }));
      await screen.findByRole('dialog');
      const first = fixture.componentInstance.ref;
      await user.click(screen.getByRole('button', { name: 'Save' }));
      await expect(firstValueFrom(must(first).afterClosed())).resolves.toBe('saved');
      await noDialog();
      await user.click(screen.getByRole('button', { name: 'Open' }));
      await screen.findByRole('dialog');
      const second = fixture.componentInstance.ref;
      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      await expect(firstValueFrom(must(second).afterClosed())).resolves.toBeUndefined();
    });

    it('resolves with the result given to ref.close, and only the first close counts', async () => {
      const user = userEvent.setup();
      const { fixture } = await render(Host);
      await user.click(screen.getByRole('button', { name: 'Open' }));
      await screen.findByRole('dialog');
      const ref = fixture.componentInstance.ref;
      const closedValue = firstValueFrom(must(ref).afterClosed());
      await user.click(screen.getByRole('button', { name: 'By ref' }));
      ref?.close(7);
      await expect(closedValue).resolves.toBe(42);
      await noDialog();
      expect(document.documentElement.style.overflow).toBe('');
    });

    it('resolves with undefined on Escape', async () => {
      const user = userEvent.setup();
      const { fixture } = await render(Host);
      await user.click(screen.getByRole('button', { name: 'Open' }));
      await screen.findByRole('dialog');
      await user.keyboard('{Escape}');
      await expect(firstValueFrom(must(fixture.componentInstance.ref).afterClosed())).resolves.toBeUndefined();
      await noDialog();
    });

    it('resolves with undefined on a press on the backdrop', async () => {
      const user = userEvent.setup();
      const { fixture } = await render(Host);
      await user.click(screen.getByRole('button', { name: 'Open' }));
      const element = await screen.findByRole('dialog');
      element.getBoundingClientRect = () => new DOMRect(100, 100, 200, 200);
      element.dispatchEvent(
        new MouseEvent('pointerdown', { bubbles: true, cancelable: true, composed: true, clientX: 10, clientY: 10 }),
      );
      await expect(firstValueFrom(must(fixture.componentInstance.ref).afterClosed())).resolves.toBeUndefined();
      await noDialog();
    });
  });

  it('returns focus to the element that was focused before the call', async () => {
    const user = userEvent.setup();
    await render(Host);
    const opener = screen.getByRole('button', { name: 'Open' });
    await user.click(opener);
    await screen.findByRole('dialog');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await noDialog();
    await waitFor(() => {
      expect(document.activeElement).toBe(opener);
    });
  });

  it('opens a template with the data and the ref in its context', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(Host);
    const ref = fixture.componentInstance.service.open<unknown, Data, string>(fixture.componentInstance.template(), {
      data: { name: 'T' },
    });
    const closed = firstValueFrom(ref.afterClosed());
    await screen.findByRole('dialog', { name: 'Template T' });
    await user.click(screen.getByRole('button', { name: 'Done' }));
    await expect(closed).resolves.toBe('from template');
    await noDialog();
  });

  it('puts a dialog opened from inside a dialog in that dialog; Escape closes the inner one only', async () => {
    const user = userEvent.setup();
    await render(Host);
    await user.click(screen.getByRole('button', { name: 'Open' }));
    const outer = await screen.findByRole<HTMLDialogElement>('dialog', { name: 'Hello Ada' });
    await user.click(screen.getByRole('button', { name: 'Nested' }));
    const inner = await screen.findByRole<HTMLDialogElement>('dialog', { name: 'Hello inner' });
    expect(outer.contains(inner)).toBe(true);
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Hello inner' })).toBeNull();
    });
    expect(screen.getByRole('dialog', { name: 'Hello Ada' }).isConnected).toBe(true);
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Nested' }));
    });
  });

  it('leaves nothing in the document after the dialog closed', async () => {
    const user = userEvent.setup();
    await render(Host);
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    await noDialog();
    await waitFor(() => {
      expect(document.querySelector('cck-dialog-container')).toBeNull();
      expect(document.querySelector('[popover]')).toBeNull();
    });
  });
});
