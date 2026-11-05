import { Component, signal } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckDialogImports, type DialogChangeDetails } from '../index';
import { stubOverlayApis } from './overlay-stubs';
import { frame } from './queries';

const TEMPLATE = `
  <ng-container
    cckDialog
    [(open)]="open"
    [closePredicate]="predicate"
    (opened)="log.push('opened:' + $event.reason)"
    (closed)="log.push('closed:' + $event.reason)"
  >
    <button cckDialogTrigger>Edit</button>
    <ng-template cckDialogPortal>
      <dialog cckDialogContent>
        <h2 cckDialogTitle>Edit draft</h2>
        <form method="dialog"><button id="submit">Submit</button></form>
        <button cckDialogClose>Cancel</button>
      </dialog>
    </ng-template>
  </ng-container>`;

@Component({ imports: [...CckDialogImports], template: TEMPLATE })
class Host {
  readonly open = signal(false);
  readonly log: string[] = [];
  readonly calls: DialogChangeDetails[] = [];
  allow = false;
  readonly predicate = (details: DialogChangeDetails): boolean => {
    this.calls.push(details);
    return this.allow;
  };
}

const dialog = (): HTMLDialogElement => screen.getByRole<HTMLDialogElement>('dialog', { name: 'Edit draft' });
const press = (target: HTMLElement): void => {
  target.getBoundingClientRect = () => new DOMRect(100, 100, 200, 200);
  target.dispatchEvent(
    new MouseEvent('pointerdown', { bubbles: true, cancelable: true, composed: true, clientX: 10, clientY: 10 }),
  );
};

describe('Dialog closePredicate', () => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('keeps the dialog open for Escape, a backdrop press and Close, with the reason, and not for an open', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(Host);
    const host = fixture.componentInstance;
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await screen.findByRole('dialog');
    expect(host.calls).toEqual([]);
    await user.keyboard('{Escape}');
    press(dialog());
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await fixture.whenStable();
    expect(host.calls.map((details) => details.reason)).toEqual(['escape', 'outside-press', 'close']);
    expect(host.calls[0]?.event?.type).toBe('keydown');
    expect(host.open()).toBe(true);
    expect(screen.queryByRole('dialog')).not.toBeNull();
    expect(host.log).toEqual(['opened:trigger']);
  });

  it('shows the dialog again after a refused <form method="dialog"> close', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(Host);
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    const element = await screen.findByRole<HTMLDialogElement>('dialog');
    element.close();
    await fixture.whenStable();
    expect(element.open).toBe(true);
    expect(fixture.componentInstance.open()).toBe(true);
    expect(fixture.componentInstance.calls.map((details) => details.reason)).toEqual(['close']);
  });

  it('closes when it returns true, and emits closed with the reason and the event', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(Host);
    fixture.componentInstance.allow = true;
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    expect(fixture.componentInstance.log).toEqual(['opened:trigger', 'closed:escape']);
  });

  it('is not asked about a write from the parent, which emits nothing', async () => {
    const { fixture } = await render(Host);
    fixture.componentInstance.open.set(true);
    await fixture.whenStable();
    await screen.findByRole('dialog');
    fixture.componentInstance.open.set(false);
    await fixture.whenStable();
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    expect(fixture.componentInstance.calls).toEqual([]);
    expect(fixture.componentInstance.log).toEqual([]);
  });

  it('runs after disableClose: a disabled cause never reaches it', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(
      `<ng-container cckDialog [disableClose]="true" [closePredicate]="predicate">
         <button cckDialogTrigger>Edit</button>
         <ng-template cckDialogPortal><dialog cckDialogContent aria-label="x"><button cckDialogClose>Cancel</button></dialog></ng-template>
       </ng-container>`,
      {
        imports: [...CckDialogImports],
        componentProperties: { predicate: vi.fn(() => true) },
      },
    );
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    await fixture.whenStable();
    expect(fixture.componentInstance.predicate).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeNull();
  });

  it('keeps focus inside after a refused press on the backdrop, putting it back when the browser moved it out', async () => {
    const user = userEvent.setup();
    await render(Host);
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await screen.findByRole('dialog');
    const cancel = screen.getByRole('button', { name: 'Cancel' });
    cancel.focus();
    press(dialog());
    cancel.blur();
    await frame();
    await frame();
    expect(document.activeElement).toBe(cancel);
  });
});

describe('Dialog opened and closed', () => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('emits opened and closed with reason and event for the changes the dialog makes itself', async () => {
    const user = userEvent.setup();
    const seen: DialogChangeDetails[] = [];
    await render(
      `<ng-container cckDialog (opened)="seen.push($event)" (closed)="seen.push($event)">
         <button cckDialogTrigger>Edit</button>
         <ng-template cckDialogPortal><dialog cckDialogContent aria-label="x"><button cckDialogClose>Cancel</button></dialog></ng-template>
       </ng-container>`,
      { imports: [...CckDialogImports], componentProperties: { seen } },
    );
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await screen.findByRole('dialog');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    expect(seen.map((details) => details.reason)).toEqual(['trigger', 'close']);
    expect(seen.every((details) => details.event instanceof Event)).toBe(true);
  });
});
