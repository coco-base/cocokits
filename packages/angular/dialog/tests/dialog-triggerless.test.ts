import { Component, ViewEncapsulation, signal } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckMenuImports } from '../../menu';
import { CckDialogImports } from '../index';
import { stubOverlayApis } from './overlay-stubs';
import { frame } from './queries';

const DIALOG = `
  <ng-template cckDialog [(open)]="open">
    <dialog cckDialogContent><h2 cckDialogTitle>Notice</h2><button cckDialogClose>Close</button></dialog>
  </ng-template>`;

@Component({
  imports: [...CckDialogImports],
  template: `<button (click)="open.set(true)">Open</button>${DIALOG}`,
})
class Page {
  readonly open = signal(false);
}

@Component({
  selector: 'shadow-page',
  imports: [...CckDialogImports],
  encapsulation: ViewEncapsulation.ShadowDom,
  template: `<button (click)="open.set(true)">Open</button>${DIALOG}`,
})
class ShadowPage {
  readonly open = signal(false);
}

@Component({
  imports: [...CckDialogImports],
  template: `
    <button [cckDialogTriggerFor]="outerDialog" [(open)]="outer">Outer</button>
    <ng-template #outerDialog>
      <dialog cckDialogContent aria-label="outer">
        <button (click)="inner.set(true)">Inner</button>
        <ng-template cckDialog [(open)]="inner">
          <dialog cckDialogContent aria-label="inner"><button cckDialogClose>Close inner</button></dialog>
        </ng-template>
      </dialog>
    </ng-template>
  `,
})
class Stacked {
  readonly outer = signal(false);
  readonly inner = signal(false);
}

@Component({
  imports: [...CckDialogImports, ...CckMenuImports],
  template: ` <button type="button" [cckMenuTriggerFor]="actions">Project actions</button>
    <ng-template #actions>
      <cck-menu-content><cck-menu-item (triggered)="open.set(true)">Rename</cck-menu-item></cck-menu-content>
    </ng-template>
    ${DIALOG}`,
})
class FromMenu {
  readonly open = signal(false);
}

describe('Dialog without a trigger', () => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
    Reflect.deleteProperty(document, 'fullscreenElement');
  });

  it('returns focus to the Menu trigger when a Menu item opened it and the item is gone', async () => {
    const user = userEvent.setup();
    await render(FromMenu);
    const menuTrigger = screen.getByRole('button', { name: 'Project actions' });
    await user.click(menuTrigger);
    await user.click(await screen.findByRole('menuitem', { name: 'Rename' }));
    await screen.findByRole('dialog', { name: 'Notice' });
    await waitFor(() => {
      expect(screen.queryByRole('menu')).toBeNull();
    });
    await user.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    await waitFor(() => {
      expect(document.activeElement).toBe(menuTrigger);
    });
  });

  it('opens from open, renders in the body and returns focus to its opener', async () => {
    const user = userEvent.setup();
    await render(Page);
    const opener = screen.getByRole('button', { name: 'Open' });
    await user.click(opener);
    const dialog = await screen.findByRole('dialog', { name: 'Notice' });
    expect(dialog.closest('[popover]')?.parentElement).toBe(document.body);
    await user.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    await waitFor(() => {
      expect(document.activeElement).toBe(opener);
    });
  });

  it('goes to the body when its opener is gone', async () => {
    const user = userEvent.setup();
    await render(Page);
    const opener = screen.getByRole('button', { name: 'Open' });
    await user.click(opener);
    await screen.findByRole('dialog');
    opener.remove();
    await user.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    await frame();
    await frame();
    expect(document.activeElement).toBe(document.body);
  });

  it('renders in the shadow root of an opener inside a shadow tree', async () => {
    const { fixture } = await render(ShadowPage);
    const shadow = (fixture.nativeElement as HTMLElement).shadowRoot;
    const opener = shadow?.querySelector('button');
    if (!shadow || !opener) throw new Error('Expected the shadow tree.');
    opener.focus();
    opener.click();
    await waitFor(() => {
      expect(shadow.querySelector('dialog')).not.toBeNull();
    });
    expect(document.body.querySelector(':scope > [popover] dialog')).toBeNull();
    expect(shadow.querySelector('dialog')?.closest('[popover]')?.parentNode).toBe(shadow);
  });

  it('renders inside the fullscreen element that holds the opener', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(Page);
    const root = fixture.nativeElement as HTMLElement;
    Object.defineProperty(document, 'fullscreenElement', { configurable: true, value: root });
    await user.click(screen.getByRole('button', { name: 'Open' }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog.closest('[popover]')?.parentElement).toBe(root);
  });

  it('renders inside the fullscreen element when nothing has focus', async () => {
    const { fixture } = await render(Page);
    const root = fixture.nativeElement as HTMLElement;
    Object.defineProperty(document, 'fullscreenElement', { configurable: true, value: root });
    (document.activeElement as HTMLElement | null)?.blur();
    fixture.componentInstance.open.set(true);
    const dialog = await screen.findByRole('dialog');
    expect(dialog.closest('[popover]')?.parentElement).toBe(root);
  });

  it('renders inside the open modal that holds the opener', async () => {
    const user = userEvent.setup();
    await render(Stacked);
    await user.click(screen.getByRole('button', { name: 'Outer' }));
    const outer = await screen.findByRole('dialog', { name: 'outer' });
    await user.click(screen.getByRole('button', { name: 'Inner' }));
    const inner = await screen.findByRole('dialog', { name: 'inner' });
    expect(inner.closest('[popover]')?.parentElement).toBe(outer);
  });
});
