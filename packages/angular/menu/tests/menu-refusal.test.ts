import { Component, signal } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckMenuImports, type MenuChangeDetails } from '../index';
import { stubOverlayApis } from './overlay-stubs';
import { frame, item, trigger } from './queries';

@Component({
  imports: [...CckMenuImports],
  template: `
    <button>Outside</button>
    <p>Empty space</p>
    <ng-container
      cckMenu
      [(open)]="open"
      [disableClose]="disableClose()"
      [closePredicate]="predicate"
      (opened)="log.push('opened:' + $event.reason)"
      (closed)="log.push('closed:' + $event.reason)"
    >
      <button cckMenuTrigger>Actions</button>
      <ng-template cckMenuPortal>
        <cck-menu-content><cck-menu-item>Edit</cck-menu-item></cck-menu-content>
      </ng-template>
    </ng-container>
  `,
})
class Host {
  readonly open = signal(false);
  readonly disableClose = signal(false);
  readonly log: string[] = [];
  readonly calls: MenuChangeDetails[] = [];
  allow = true;
  readonly predicate = (details: MenuChangeDetails): boolean => {
    this.calls.push(details);
    return this.allow;
  };
}

type User = ReturnType<typeof userEvent.setup>;

async function opened(user: User, host: Host): Promise<void> {
  await user.click(trigger());
  await screen.findByRole('menu');
  await waitFor(() => {
    expect(document.activeElement).toBe(item('Edit'));
  });
  host.calls.length = 0;
}

describe('Menu refusal', () => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('disableClose keeps it open on Escape, a press outside and a focus leave, with no change and no predicate call', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(Host);
    const host = fixture.componentInstance;
    host.disableClose.set(true);
    await opened(user, host);
    await user.keyboard('{Escape}');
    await user.click(screen.getByText('Empty space'));
    await user.click(screen.getByRole('button', { name: 'Outside' }));
    await user.tab();
    await frame();
    expect(screen.queryByRole('menu')).not.toBeNull();
    expect(host.open()).toBe(true);
    expect(host.calls).toEqual([]);
    expect(host.log).toEqual(['opened:trigger']);
  });

  // The trigger, an item and the parent still close a menu that disableClose guards.
  it.each([
    ['the trigger', async (user: User) => user.click(trigger()), ['opened:trigger', 'closed:trigger']],
    ['an item', async (user: User) => user.click(item('Edit')), ['opened:trigger', 'closed:item']],
  ] as const)('disableClose still lets %s close it', async (_name, act, log) => {
    const user = userEvent.setup();
    const { fixture } = await render(Host);
    const host = fixture.componentInstance;
    host.disableClose.set(true);
    await opened(user, host);
    await act(user);
    await waitFor(() => {
      expect(screen.queryByRole('menu')).toBeNull();
    });
    expect(host.log).toEqual(log);
  });

  it('closePredicate returning false keeps it open for every close the menu starts, with the reason', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(Host);
    const host = fixture.componentInstance;
    await opened(user, host);
    host.allow = false;
    await user.keyboard('{Escape}');
    await user.click(screen.getByText('Empty space'));
    await user.click(trigger());
    await user.click(item('Edit'));
    await frame();
    expect(host.calls.map((details) => details.reason)).toEqual(['escape', 'outside-press', 'trigger', 'item']);
    expect(host.open()).toBe(true);
    expect(screen.queryByRole('menu')).not.toBeNull();
    expect(host.log).toEqual(['opened:trigger']);
  });

  it('closePredicate is asked about a focus leave too, and is not asked about a write from the parent', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(Host);
    const host = fixture.componentInstance;
    await opened(user, host);
    host.allow = false;
    await user.tab();
    await frame();
    expect(host.calls.map((details) => details.reason)).toEqual(['focus-out']);
    expect(screen.queryByRole('menu')).not.toBeNull();
    host.calls.length = 0;
    host.open.set(false);
    await fixture.whenStable();
    await waitFor(() => {
      expect(screen.queryByRole('menu')).toBeNull();
    });
    expect(host.calls).toEqual([]);
    expect(host.log).toEqual(['opened:trigger']);
  });
});
