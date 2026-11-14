import { Component, signal } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckMenuImports, type MenuChangeDetails } from '../index';
import { stubOverlayApis } from './overlay-stubs';
import { item, trigger } from './queries';

@Component({
  imports: [...CckMenuImports],
  template: `
    <button>Outside</button>
    <ng-container
      cckMenu
      [(open)]="open"
      (opened)="log.push('opened:' + $event.reason)"
      (closed)="log.push('closed:' + $event.reason); details.push($event)"
    >
      <button cckMenuTrigger>Actions</button>
      <ng-template cckMenuPortal>
        <cck-menu-content><cck-menu-item>Edit</cck-menu-item></cck-menu-content>
      </ng-template>
    </ng-container>
  `,
})
class Controlled {
  readonly open = signal(false);
  readonly log: string[] = [];
  readonly details: MenuChangeDetails[] = [];
}

@Component({
  imports: [...CckMenuImports],
  template: `
    <ng-container cckMenu (opened)="log.push('opened:' + $event.reason)">
      <button cckMenuTrigger>Actions</button>
      <ng-template cckMenuPortal>
        <cck-menu-content><cck-menu-item>Edit</cck-menu-item></cck-menu-content>
      </ng-template>
    </ng-container>
  `,
})
class Uncontrolled {
  readonly log: string[] = [];
}

describe('Menu open state', () => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('is uncontrolled without an open binding', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(Uncontrolled);
    await user.click(trigger());
    expect(await screen.findByRole('menu')).toBeTruthy();
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    await user.click(trigger());
    await waitFor(() => {
      expect(screen.queryByRole('menu')).toBeNull();
    });
    expect(fixture.componentInstance.log).toEqual(['opened:trigger']);
  });

  it('follows the parent: open writes show and hide the menu and emit nothing', async () => {
    const { fixture } = await render(Controlled);
    const host = fixture.componentInstance;
    host.open.set(true);
    await fixture.whenStable();
    expect(await screen.findByRole('menu')).toBeTruthy();
    host.open.set(false);
    await fixture.whenStable();
    await waitFor(() => {
      expect(screen.queryByRole('menu')).toBeNull();
    });
    expect(host.log).toEqual([]);
  });

  it('shows a menu that is open at the first render', async () => {
    await render(
      `<ng-container cckMenu [open]="true"><button cckMenuTrigger>Actions</button><ng-template cckMenuPortal><cck-menu-content><cck-menu-item>Edit</cck-menu-item></cck-menu-content></ng-template></ng-container>`,
      {
        imports: [...CckMenuImports],
      },
    );
    expect(await screen.findByRole('menu')).toBeTruthy();
  });

  // One row per reason the menu reports.
  it.each([
    {
      reason: 'trigger',
      act: async (user: ReturnType<typeof userEvent.setup>) => {
        await user.click(trigger());
        await user.click(trigger());
      },
      log: ['opened:trigger', 'closed:trigger'],
    },
    {
      reason: 'item',
      act: async (user: ReturnType<typeof userEvent.setup>) => {
        await user.click(trigger());
        await user.click(await screen.findByRole('menuitem', { name: 'Edit' }));
      },
      log: ['opened:trigger', 'closed:item'],
    },
    {
      reason: 'escape',
      act: async (user: ReturnType<typeof userEvent.setup>) => {
        await user.click(trigger());
        await screen.findByRole('menu');
        await user.keyboard('{Escape}');
      },
      log: ['opened:trigger', 'closed:escape'],
    },
    {
      reason: 'outside-press',
      act: async (user: ReturnType<typeof userEvent.setup>) => {
        await user.click(trigger());
        await screen.findByRole('menu');
        await user.click(screen.getByRole('button', { name: 'Outside' }));
      },
      log: ['opened:trigger', 'closed:outside-press'],
    },
    {
      reason: 'focus-out',
      act: async (user: ReturnType<typeof userEvent.setup>) => {
        await user.click(trigger());
        await waitFor(() => {
          expect(document.activeElement).toBe(item('Edit'));
        });
        await user.tab();
      },
      log: ['opened:trigger', 'closed:focus-out'],
    },
  ])('reports the reason $reason with the event, and the model follows', async ({ act, log }) => {
    const user = userEvent.setup();
    const { fixture } = await render(Controlled);
    await act(user);
    await waitFor(() => {
      expect(screen.queryByRole('menu')).toBeNull();
    });
    const host = fixture.componentInstance;
    expect(host.log).toEqual(log);
    expect(host.open()).toBe(false);
    expect(host.details[0]?.event).toBeInstanceOf(Event);
  });
});
