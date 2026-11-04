import { Component, signal } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckPopoverImports, type PopoverChangeDetails } from '../index';
import { stubOverlayApis } from './overlay-stubs';

const frame = (): Promise<void> =>
  new Promise((resolve) => {
    requestAnimationFrame(() => {
      resolve();
    });
  });

@Component({
  imports: [...CckPopoverImports],
  template: `
    <button id="after">After</button>
    <p id="empty">Empty space</p>
    <ng-container
      cckPopover
      [(open)]="open"
      [disableClose]="disableClose()"
      [restoreFocus]="restoreFocus()"
      [closePredicate]="predicate"
      (opened)="log.push('opened:' + $event.reason)"
      (closed)="log.push('closed:' + $event.reason)"
    >
      <button cckPopoverTrigger>Share</button>
      <ng-template cckPopoverPortal>
        <div cckPopoverContent aria-label="Share this page">
          <a href="#x">First</a>
          <button cckPopoverClose>Close</button>
        </div>
      </ng-template>
    </ng-container>
  `,
})
class Host {
  readonly open = signal(false);
  readonly disableClose = signal(false);
  readonly restoreFocus = signal(true);
  readonly log: string[] = [];
  readonly calls: PopoverChangeDetails[] = [];
  allow = true;
  readonly predicate = (details: PopoverChangeDetails): boolean => {
    this.calls.push(details);
    return this.allow;
  };
}

const trigger = (): HTMLElement => screen.getByRole('button', { name: 'Share' });
const emptySpace = (): HTMLElement => screen.getByText('Empty space');

describe('Popover refusal and notification', () => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('disableClose keeps it open on Escape, an outside press and focus leaving, and Close still closes', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(Host);
    const host = fixture.componentInstance;
    host.disableClose.set(true);
    await user.click(trigger());
    await screen.findByRole('dialog');
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole('link', { name: 'First' }));
    });
    await user.keyboard('{Escape}');
    await user.click(emptySpace());
    await user.tab();
    await user.tab();
    await frame();
    expect(screen.queryByRole('dialog')).not.toBeNull();
    expect(host.open()).toBe(true);
    expect(host.calls).toEqual([]);
    await user.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    expect(host.log).toEqual(['opened:trigger', 'closed:close']);
  });

  it('closePredicate keeps it open for every close it makes itself, with the reason, and not for an open', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(Host);
    const host = fixture.componentInstance;
    host.allow = false;
    await user.click(trigger());
    await screen.findByRole('dialog');
    expect(host.calls).toEqual([]);
    await user.keyboard('{Escape}');
    await user.click(emptySpace());
    await user.click(screen.getByRole('button', { name: 'Close' }));
    await user.click(trigger());
    await frame();
    expect(host.calls.map((details) => details.reason)).toEqual(['escape', 'outside-press', 'close', 'trigger']);
    expect(host.open()).toBe(true);
    expect(screen.queryByRole('dialog')).not.toBeNull();
    expect(host.log).toEqual(['opened:trigger']);
  });

  it('closePredicate is not asked about a write from the parent, which emits nothing', async () => {
    const { fixture } = await render(Host);
    const host = fixture.componentInstance;
    host.allow = false;
    host.open.set(true);
    await fixture.whenStable();
    await screen.findByRole('dialog');
    host.open.set(false);
    await fixture.whenStable();
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    expect(host.calls).toEqual([]);
    expect(host.log).toEqual([]);
  });

  it('emits opened and closed with the reason and the event', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(Host);
    await user.click(trigger());
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    expect(fixture.componentInstance.log).toEqual(['opened:trigger', 'closed:escape']);
    expect(fixture.componentInstance.calls[0]?.event?.type).toBe('keydown');
  });

  it('returns focus to the trigger on close, and not with restoreFocus false', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(Host);
    await user.click(trigger());
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(document.activeElement).toBe(trigger());
    });
    fixture.componentInstance.restoreFocus.set(false);
    await user.click(trigger());
    await screen.findByRole('dialog');
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole('link', { name: 'First' }));
    });
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    await frame();
    await frame();
    expect(document.activeElement).not.toBe(trigger());
  });

  it('warns in development when the portal has no trigger', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await render(
      `<ng-container cckPopover><ng-template cckPopoverPortal><div cckPopoverContent aria-label="x">x</div></ng-template></ng-container>`,
      { imports: [...CckPopoverImports] },
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('CocoKits: a PopoverPortal has no PopoverTrigger'));
  });
});
