import { Component, signal } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckMenuImports } from '../index';
import { stubOverlayApis } from './overlay-stubs';
import { item, trigger } from './queries';

@Component({
  imports: [...CckMenuImports],
  template: `
    <ng-container cckMenu [(open)]="open">
      <button cckMenuTrigger>Actions</button>
      <ng-template cckMenuPortal>
        <cck-menu-content>
          <cck-menu-item (triggered)="run('Edit', $event)">Edit</cck-menu-item>
          <cck-menu-item [disabled]="true" (triggered)="run('Move', $event)">Move</cck-menu-item>
          <cck-menu-item (click)="$event.preventDefault()" (triggered)="run('Vetoed', $event)">Vetoed</cck-menu-item>
        </cck-menu-content>
      </ng-template>
    </ng-container>
  `,
})
class Host {
  readonly open = signal(false);
  readonly log: string[] = [];
  readonly events: Event[] = [];
  keepOpen = false;

  run(name: string, event: Event): void {
    this.log.push(name);
    this.events.push(event);
    if (this.keepOpen) event.preventDefault();
  }
}

const keys = [
  ['click', async (user: ReturnType<typeof userEvent.setup>, name: string) => user.click(item(name))],
  [
    'Enter',
    async (user: ReturnType<typeof userEvent.setup>, name: string) => {
      item(name).focus();
      await user.keyboard('{Enter}');
    },
  ],
  [
    'Space',
    async (user: ReturnType<typeof userEvent.setup>, name: string) => {
      item(name).focus();
      await user.keyboard(' ');
    },
  ],
] as const;

describe('Menu item', () => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
  });

  async function open(): Promise<{ host: Host; user: ReturnType<typeof userEvent.setup> }> {
    const user = userEvent.setup();
    const { fixture } = await render(Host);
    await user.click(trigger());
    await screen.findByRole('menu');
    await waitFor(() => {
      expect(document.activeElement).toBe(item('Edit'));
    });
    return { host: fixture.componentInstance, user };
  }

  describe.each(keys)('%s', (_name, act) => {
    it('runs an enabled item once with a cancelable event, then closes with the reason item', async () => {
      const { host, user } = await open();
      await act(user, 'Edit');
      await waitFor(() => {
        expect(screen.queryByRole('menu')).toBeNull();
      });
      expect(host.log).toEqual(['Edit']);
      expect(host.events[0]?.cancelable).toBe(true);
      expect(host.open()).toBe(false);
      expect(host.log).toEqual(['Edit']);
    });

    it('keeps the menu open when the item event is prevented', async () => {
      const { host, user } = await open();
      host.keepOpen = true;
      await act(user, 'Edit');
      expect(host.log).toEqual(['Edit']);
      expect(host.events[0]?.defaultPrevented).toBe(true);
      expect(screen.queryByRole('menu')).not.toBeNull();
      expect(host.open()).toBe(true);
      expect(trigger().getAttribute('aria-expanded')).toBe('true');
    });

    it('runs nothing for a disabled item and keeps the menu open', async () => {
      const { host, user } = await open();
      await act(user, 'Move');
      expect(host.log).toEqual([]);
      expect(screen.queryByRole('menu')).not.toBeNull();
      expect(item('Move').getAttribute('aria-disabled')).toBe('true');
    });
  });

  it('runs nothing when the click itself was prevented by the page', async () => {
    const { host, user } = await open();
    await user.click(item('Vetoed'));
    expect(host.log).toEqual([]);
    expect(screen.queryByRole('menu')).not.toBeNull();
  });
});
