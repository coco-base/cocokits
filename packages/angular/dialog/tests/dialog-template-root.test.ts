import { Component, signal, type ApplicationRef } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckDialogImports } from '../index';
import { bootstrapOnClient, renderOnServer } from './fixtures';
import { stubOverlayApis } from './overlay-stubs';
import { closed, frame } from './queries';
import { must } from './service-fixtures';

@Component({
  imports: [...CckDialogImports],
  template: `
    <button type="button">Elsewhere</button>
    <ng-template cckDialog [(open)]="open" role="alertdialog" width="30rem" #notice="cckDialog">
      <dialog cckDialogContent>
        <h2 cckDialogTitle>Notice</h2>
        <button cckDialogClose>Close</button>
      </dialog>
    </ng-template>
    <button type="button" (click)="notice.open.set(true)">By reference</button>
  `,
})
class Page {
  readonly open = signal(false);
}

@Component({
  imports: [...CckDialogImports],
  template: `
    <button type="button" (click)="outer.set(true)">Outer</button>
    <ng-template cckDialog [(open)]="outer">
      <dialog cckDialogContent aria-label="outer">
        <button type="button" (click)="inner.set(true)">Inner</button>
        <ng-template cckDialog [(open)]="inner">
          <dialog cckDialogContent aria-label="inner"><button cckDialogClose>Close inner</button></dialog>
        </ng-template>
      </dialog>
    </ng-template>
  `,
})
class Nested {
  readonly outer = signal(false);
  readonly inner = signal(false);
}

@Component({
  selector: 'app-root',
  imports: [CckDialogImports],
  template: `
    <p>Page</p>
    <ng-template cckDialog [open]="true">
      <dialog cckDialogContent>
        <h2 cckDialogTitle>{{ title }}</h2>
      </dialog>
    </ng-template>
  `,
})
class OpenAtStart {
  protected readonly title = 'Delete project';
}

/** Markup without the hydration and event-replay bookkeeping Angular adds. */
const normalized = (root: Element): string =>
  root.innerHTML.replace(/\s+(?:ngh|jsaction)="[^"]*"/g, '').replace(/<!--[^>]*-->/g, '');

describe('Dialog root on its own template', () => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
    document.documentElement.removeAttribute('style');
  });

  it('renders nothing where the template is declared while closed', async () => {
    const { fixture } = await render(Page);
    expect((fixture.nativeElement as HTMLElement).querySelector('dialog')).toBeNull();
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  it('opens from the state of the parent, writes the close back and returns focus to the element that had it', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(Page);
    const elsewhere = screen.getByRole('button', { name: 'Elsewhere' });
    elsewhere.focus();
    fixture.componentInstance.open.set(true);
    const dialog = await screen.findByRole('alertdialog', { name: 'Notice' });
    expect(dialog.style.width).toBe('30rem');
    await user.click(screen.getByRole('button', { name: 'Close' }));
    await closed();
    expect(fixture.componentInstance.open()).toBe(false);
    await waitFor(() => {
      expect(document.activeElement).toBe(elsewhere);
    });
  });

  it('opens through its exportAs reference', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(Page);
    await user.click(screen.getByRole('button', { name: 'By reference' }));
    await screen.findByRole('alertdialog', { name: 'Notice' });
    expect(fixture.componentInstance.open()).toBe(true);
  });

  it('opens a dialog in the content of another, and Escape closes only the top one', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(Nested);
    await user.click(screen.getByRole('button', { name: 'Outer' }));
    const outer = await screen.findByRole('dialog', { name: 'outer' });
    await user.click(screen.getByRole('button', { name: 'Inner' }));
    const inner = await screen.findByRole('dialog', { name: 'inner' });
    expect(inner.closest('[popover]')?.parentElement).toBe(outer);
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'inner' })).toBeNull();
    });
    expect(fixture.componentInstance.inner()).toBe(false);
    expect(fixture.componentInstance.outer()).toBe(true);
    expect(outer.isConnected).toBe(true);
  });
});

describe('Dialog root on its own template, server and hydration', () => {
  const apps: ApplicationRef[] = [];
  beforeEach(stubOverlayApis);
  afterEach(() => {
    for (const app of apps.splice(0)) app.destroy();
    document.body.innerHTML = '';
    document.documentElement.removeAttribute('style');
    vi.restoreAllMocks();
  });

  it('renders no content on the server, hydrates without a problem, then shows the open dialog', async () => {
    const html = await renderOnServer(OpenAtStart);
    const body = /<body[^>]*>([\s\S]*)<\/body>/.exec(html)?.[1] ?? '';
    expect(body).toContain('<p>Page</p>');
    expect(body).not.toContain('<dialog');
    expect(body).not.toContain('Delete project');

    document.body.innerHTML = body;
    const problems: unknown[][] = [];
    for (const method of ['error', 'warn'] as const)
      vi.spyOn(console, method).mockImplementation((...args) => {
        problems.push(args);
      });
    const logs: unknown[][] = [];
    vi.spyOn(console, 'log').mockImplementation((...args) => {
      logs.push(args);
    });
    const app = await bootstrapOnClient(true, OpenAtStart);
    apps.push(app);
    await app.whenStable();
    await frame();

    expect(logs.some(([m]) => String(m).startsWith('Angular hydrated'))).toBe(true);
    expect(problems).toEqual([]);
    const root = must(document.querySelector('app-root'));
    expect(normalized(root)).not.toContain('<dialog');
    const dialog = must(document.querySelector<HTMLDialogElement>('dialog.cck-dialog__content'));
    expect(dialog.closest('[popover="manual"]')).not.toBeNull();
    expect(dialog.open).toBe(true);
  });
});
